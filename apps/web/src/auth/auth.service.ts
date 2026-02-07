import { HashingService, TokenService, PrismaService, MfaService, PasswordBreachService, MailService } from '@app/shared';
import { User } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private hashingService: HashingService,
    private tokenService: TokenService,
    private mfaService: MfaService,
    private passwordBreachService: PasswordBreachService,
    private mailService: MailService,
  ) {}

  async generateMfaSecret(userId: string, email: string) {
    return this.mfaService.generateSecret(userId, email);
  }

  async verifyMfa(userId: string, token: string) {
    const verified = await this.mfaService.verifyToken(userId, token);
    if (!verified) {
      throw new UnauthorizedException('Invalid MFA token');
    }
    return { success: true };
  }

  async validateUser(email: string, pass: string): Promise<Omit<User, 'password' | 'refreshToken'> | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await this.hashingService.compare(pass, user.password))) {
      const { password, refreshToken, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User | Omit<User, 'password' | 'refreshToken'>, ip?: string, ua?: string) {
    const tokens = await this.tokenService.generateTokens(user, ip, ua);
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string) {
    return this.tokenService.refreshTokens(refreshToken);
  }

  async logout(userId: string) {
    return this.tokenService.revokeRefreshToken(userId);
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    await this.passwordBreachService.checkPassword(registerDto.password);

    const hashedPassword = await this.hashingService.hash(registerDto.password);
    const user = await this.prisma.user.create({
      data: {
        ...registerDto,
        password: hashedPassword,
        role: 'USER',
      },
    });

    const { password, refreshToken, ...result } = user;
    return result;
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: 'If this email exists, a reset link has been sent.' };
    }

    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetExpires: expires,
      },
    });

    await this.mailService.sendPasswordResetEmail(user.email, token);
    return { message: 'If this email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPass: string) {
    const user = await this.prisma.user.findUnique({
      where: { resetToken: token },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (user.resetExpires && new Date() > user.resetExpires) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    await this.passwordBreachService.checkPassword(newPass);
    const hashedPassword = await this.hashingService.hash(newPass);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpires: null,
        refreshToken: null,
      },
    });

    return { message: 'Password has been reset successfully.' };
  }
}
