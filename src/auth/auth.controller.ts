import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiBody({ type: AuthDto })
  @Public()
  @Post('signin')
  async signIn(@Body() signInDto: Record<string, any>) {
    const user = await this.authService.validateUser(
      signInDto.username,
      signInDto.password,
    );
    return await this.authService.generateJWT(user);
  }

  @Get('me')
  getProfile(@Request() req) {
    return req.user;
  }
}
