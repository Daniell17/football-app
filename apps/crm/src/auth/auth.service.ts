import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HashingService, TokenService, MfaService, PasswordBreachService } from '@app/shared';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private hashingService: HashingService,
    private tokenService: TokenService,
    private mfaService: MfaService,
    private passwordBreachService: PasswordBreachService,
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

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await this.hashingService.compare(pass, user.password))) {
      const { password, refreshToken, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const tokens = await this.tokenService.generateTokens(user);
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

  async register(createUserDto: any) {
    await this.passwordBreachService.checkPassword(createUserDto.password);
    const hashedPassword = await this.hashingService.hash(createUserDto.password);
    return this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }
}
