import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { HashingService } from './hashing.service';
import * as crypto from 'crypto';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private hashingService: HashingService,
  ) {}

  async generateTokens(user: any, ip?: string, ua?: string) {
    // 1. Create a session first to get the ID (or generate ID manually)
    const sessionId = crypto.randomUUID();
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const refreshHash = await this.hashingService.hash(refreshToken);
    
    // 2. Create Access Token with 'sid' claim
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role, 
      sid: sessionId 
    };
    
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    // 3. Store Session in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await this.prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        refreshHash,
        ipAddress: ip,
        userAgent: ua,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: `${sessionId}.${refreshToken}`, // Return combined ID and Token
    };
  }

  async refreshTokens(refreshTokenString: string) {
    try {
      if (!refreshTokenString || !refreshTokenString.includes('.')) {
        throw new UnauthorizedException('Invalid refresh token format');
      }

      const [sessionId, token] = refreshTokenString.split('.');
      
      const session = await this.prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: true },
      });

      if (!session) {
        throw new UnauthorizedException('Session not found');
      }

      if (new Date() > session.expiresAt) {
        await this.prisma.session.delete({ where: { id: sessionId } });
        throw new UnauthorizedException('Session expired');
      }

      const isMatch = await this.hashingService.compare(token, session.refreshHash);
      if (!isMatch) {
        // Token Reuse / Theft Detection
        // Revoke all sessions for this user as a security measure
        await this.prisma.session.deleteMany({ where: { userId: session.userId }});
        throw new UnauthorizedException('Refresh token misuse detected');
      }

      // Rotate Token
      const newRefreshToken = crypto.randomBytes(32).toString('hex');
      const newHash = await this.hashingService.hash(newRefreshToken);
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await this.prisma.session.update({
        where: { id: sessionId },
        data: {
          refreshHash: newHash,
          lastActiveAt: new Date(),
          expiresAt,
        },
      });

      // Generate new Access Token
      const payload = { 
        email: session.user.email, 
        sub: session.user.id, 
        role: session.user.role, 
        sid: sessionId 
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      });

      return {
        accessToken,
        refreshToken: `${sessionId}.${newRefreshToken}`,
      };
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeRefreshToken(userId: string) {
    // Revoke all sessions for the user
    await this.prisma.session.deleteMany({
      where: { userId },
    });
  }
  
  async revokeSession(sessionId: string) {
    await this.prisma.session.delete({
      where: { id: sessionId },
    });
  }
}
