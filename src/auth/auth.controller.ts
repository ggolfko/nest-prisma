import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import {
  ResendEmailVerificationDto,
  SignInDto,
  SignUpDto,
} from './dto/auth.dto';
import {
  EMAIL_VERIFICATION_SENT,
  EMAIL_VERIFIED,
  USER_NOT_FOUND,
} from './auth.constants';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiBody({ type: SignInDto })
  @Public()
  @Post('signin')
  async signIn(@Body() signInDto: Record<string, any>) {
    const user = await this.authService.validateUser(
      signInDto.username,
      signInDto.password,
    );
    return await this.authService.generateJWT(user);
  }

  @ApiBody({ type: SignUpDto })
  @Public()
  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    const user = await this.authService.createNewUser(signUpDto);
    await this.authService.sendEmailVerification(user);
    return await this.authService.generateJWT(user);
  }

  @ApiBody({ type: ResendEmailVerificationDto })
  @Public()
  @Post('resend-verification')
  async sendEmailVerification(
    @Body() resendEmailVerificationDto: ResendEmailVerificationDto,
  ) {
    const { email } = resendEmailVerificationDto;
    const user = await this.authService.getUserByEmailOrUsername(email, email);
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }
    await this.authService.createEmailVerification(user);
    await this.authService.sendEmailVerification(user);
    return {
      statusCode: HttpStatus.OK,
      message: EMAIL_VERIFICATION_SENT,
    };
  }

  @Public()
  @Get('verify')
  async verifyEmail(
    @Query('email') email: string,
    @Query('token') token: string,
  ) {
    await this.authService.verifyEmail(email, token);
    return {
      statusCode: HttpStatus.OK,
      message: EMAIL_VERIFIED,
    };
  }

  @Get('me')
  getProfile(@Request() req: any) {
    return req.user;
  }
}
