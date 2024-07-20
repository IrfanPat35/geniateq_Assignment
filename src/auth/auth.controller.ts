import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('generate-otp')
  async generateOtp(@Body('phone') phone: string) {
    return this.authService.generateOtp(phone);
  }

  @Post('verify-otp')
  async verifyOtp(@Body('phone') phone: string, @Body('otp') otp: string) {
    return this.authService.verifyOtp(phone, otp);
  }
}
