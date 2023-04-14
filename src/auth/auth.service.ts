import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verifyPassword } from '@utils/auth.utils';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<any> {
    const userFound = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            email: username,
          },
          {
            username: username,
          },
        ],
      },
    });

    if (!userFound) {
      throw new NotFoundException('Incorrect username or password');
    }

    const isPasswordValid = await verifyPassword(
      `${password}${userFound.hash}`,
      userFound.password,
    );

    if (!isPasswordValid) {
      throw new NotFoundException('Incorrect username or password');
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
}
