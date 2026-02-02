import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { HashingService } from './hashing.service';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private hashingService: HashingService,
  ) {}

  async generateTokens(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role, version: user.tokenVersion };
    
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_SECRET || 'refreshSecretKey',
      }),
    ]);

    const hashedRefreshToken = await this.hashingService.hash(refreshToken);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refreshSecretKey',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Access Denied');
      }

      const isMatch = await this.hashingService.compare(refreshToken, user.refreshToken);
      if (!isMatch) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: null, tokenVersion: { increment: 1 } },
        });
        throw new UnauthorizedException('Access Denied - Token potentially stolen');
      }

      if (user.tokenVersion !== payload.version) {
        throw new UnauthorizedException('Token version mismatch');
      }

      return this.generateTokens(user);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeRefreshToken(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }
}
