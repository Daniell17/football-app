import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HashingService, TokenService, MfaService, PasswordBreachService, MailService } from '@app/shared';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
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

  async logout(userId: string) {
    return this.tokenService.revokeRefreshToken(userId);
  }

  async validateUser(email: string, pass: string): Promise<Omit<User, 'password' | 'refreshToken'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await this.hashingService.compare(pass, user.password))) {
      // Remove sensitive data
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

  async register(createUserDto: CreateUserDto) {
    await this.passwordBreachService.checkPassword(createUserDto.password);
    const hashedPassword = await this.hashingService.hash(createUserDto.password);
    return this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal user existence
      return { message: 'If this email exists, a reset link has been sent.' };
    }

    // Generate a simple token (e.g., random bytes)
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour expiration

    await this.usersService.setResetToken(user.id, token, expires);
    await this.mailService.sendPasswordResetEmail(user.email, token);

    return { message: 'If this email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPass: string) {
    const user = await this.usersService.findByResetToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (user.resetExpires && new Date() > user.resetExpires) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    await this.passwordBreachService.checkPassword(newPass);
    const hashedPassword = await this.hashingService.hash(newPass);

    await this.usersService.updatePassword(user.id, hashedPassword);

    return { message: 'Password has been reset successfully.' };
  }
}
