import { HashingService, TokenService, PrismaService, MfaService, PasswordBreachService } from '@app/shared';
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

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
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
}
