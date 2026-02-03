import { Controller, Post, Body, UseGuards, Get, UnauthorizedException, Ip, Headers as IncomingHeaders } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, GetUser, RefreshDto, VerifyMfaDto, AuthRateLimitGuard } from '@app/shared';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(AuthRateLimitGuard)
  @ApiOperation({ summary: 'Login and get JWT token' })
  async login(@Body() loginDto: LoginDto, @Ip() ip: string, @IncomingHeaders('user-agent') ua: string) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user, ip, ua);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT token' })
  async refresh(@Body() refreshDto: RefreshDto) {
    return this.authService.refresh(refreshDto.refreshToken);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  async logout(@GetUser() user: any) {
    return this.authService.logout(user.id);
  }

  @Get('mfa/setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate MFA secret and QR code' })
  async setupMfa(@GetUser() user: any) {
    return this.authService.generateMfaSecret(user.id, user.email);
  }

  @Post('mfa/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify MFA token and enable MFA' })
  async verifyMfa(@GetUser() user: any, @Body() verifyMfaDto: VerifyMfaDto) {
    return this.authService.verifyMfa(user.id, verifyMfaDto.token);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@GetUser() user: any) {
    return user;
  }

  @Post('forgot-password')
  @UseGuards(AuthRateLimitGuard)
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @UseGuards(AuthRateLimitGuard)
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() body: any) {
    return this.authService.resetPassword(body.token, body.password);
  }
}
