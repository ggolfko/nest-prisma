import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { generateSalt, passwordHash, verifyPassword } from '@utils/auth.utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from './dto/auth.dto';
import { generateGravatar } from '@utils/miscellaneous.utils';
import { add } from 'date-fns';
import { createMailTransport } from '@utils/mailer.utils';
import { registerEmailTemplate, verifyExpires } from '@utils/email.utils';
import {
  EMAIL_VERIFY_MESSAGE,
  USER_ALREADY_EXISTS,
  USER_LOGIN_FAILED,
  USER_NOT_FOUND,
  VERIFY_EMAIL_EXPIRED,
  VERIFY_EMAIL_TOKEN_INVALID,
} from './auth.constants';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async getUserByEmailOrUsername(email: string, username: string) {
    return await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            email: email,
          },
          {
            username: username,
          },
        ],
      },
    });
  }

  async getUserByUserId(userId: string) {
    return await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

  async updateUser(userId: string, dto: any) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });
  }

  async validateUser(username: string, password: string): Promise<any> {
    const userFound = await this.getUserByEmailOrUsername(username, username);

    if (!userFound.emailVerifiedAt) {
      throw new UnauthorizedException(EMAIL_VERIFY_MESSAGE);
    }

    if (!userFound) {
      throw new NotFoundException(USER_LOGIN_FAILED);
    }

    const isPasswordValid = await verifyPassword(
      `${password}${userFound.hash}`,
      userFound.password,
    );

    if (!isPasswordValid) {
      throw new NotFoundException(USER_LOGIN_FAILED);
    }

    return userFound;
  }

  async generateJWT(user: any) {
    const payload = {
      email: user.email,
      username: user.username,
      sub: user.id,
    };
    return {
      message: 'Access granted',
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async createNewUser(signUpDto: SignUpDto) {
    const { email, username, password, firstName, lastName, phoneNumber } =
      signUpDto;

    const existingUser = await this.getUserByEmailOrUsername(email, username);
    if (existingUser) {
      throw new ConflictException(USER_ALREADY_EXISTS);
    }

    const { salt, encrypted } = await passwordHash(password);

    return await this.prisma.$transaction(async (prisma) => {
      return await prisma.user.create({
        data: {
          email,
          username,
          hash: salt,
          password: encrypted,
          profile: {
            create: {
              avatarUrl: generateGravatar(`${firstName} ${lastName}`),
              firstName,
              lastName,
              phoneNumber,
            },
          },
          emailVerifications: {
            create: {
              token: generateSalt(),
              expiresAt: add(new Date(), {
                minutes: 15,
              }),
            },
          },
        },
      });
    });
  }

  async getEmailVerificationByUserId(userId: string) {
    return await this.prisma.emailVerification.findFirst({
      where: {
        AND: [
          {
            userId,
          },
        ],
      },
      include: { user: true },
    });
  }

  async sendEmailVerification(user: any): Promise<boolean> {
    const emailVerificationFound = await this.getEmailVerificationByUserId(
      user.id,
    );

    if (
      emailVerificationFound?.expiresAt &&
      verifyExpires(emailVerificationFound.expiresAt)
    ) {
      throw new ConflictException(VERIFY_EMAIL_EXPIRED);
    }

    const transporter = await createMailTransport();

    const mailOptions = {
      from: process.env.MAILER_FORM,
      to: emailVerificationFound.user.email,
      subject: `Welcome to [Your App Name]`,
      text: `Dear ${emailVerificationFound.user.username}, Thank you for registering with [Your App Name]`,
      html: registerEmailTemplate({
        name: emailVerificationFound.user.username,
        url: `https://example.com?token=${emailVerificationFound.token}`,
      }),
    };

    return await new Promise<boolean>(function (resolve) {
      return transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          Logger.log('📧 Message sent', error);
          return resolve(false);
        }
        Logger.log('📧 Message sent', info.messageId);
        return resolve(true);
      });
    });
  }

  async createEmailVerification(user: any) {
    return await this.prisma.$transaction(async (prisma) => {
      await prisma.emailVerification.deleteMany({
        where: {
          userId: user.id,
        },
      });
      return await prisma.emailVerification.create({
        data: {
          userId: user.id,
          token: generateSalt(),
          expiresAt: add(new Date(), {
            minutes: 15,
          }),
        },
      });
    });
  }

  async deleteEmailVerification(emailVerificationId: string) {
    return await this.prisma.$transaction(async (prisma) => {
      return await prisma.emailVerification.delete({
        where: {
          id: emailVerificationId,
        },
      });
    });
  }

  async verifyEmail(email: string, token: string): Promise<void> {
    const user = await this.getUserByEmailOrUsername(email, email);
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }
    const emailVerification = await this.getEmailVerificationByUserId(user.id);
    if (!emailVerification || emailVerification.token !== token) {
      throw new BadRequestException(VERIFY_EMAIL_TOKEN_INVALID);
    }
    if (verifyExpires(emailVerification.expiresAt)) {
      throw new BadRequestException(VERIFY_EMAIL_EXPIRED);
    }
    await this.updateUser(user.id, { emailVerifiedAt: new Date() });
    await this.deleteEmailVerification(emailVerification.id);
  }
}
