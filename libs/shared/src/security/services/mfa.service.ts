import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MfaService {
  constructor(private prisma: PrismaService) {}

  async generateSecret(userId: string, email: string) {
    const secret = speakeasy.generateSecret({
      name: `FootballApp:${email}`,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret.base32 },
    });

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url || '');

    return {
      secret: secret.base32,
      qrCodeUrl,
    };
  }

  async verifyToken(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { mfaSecret: true },
    });

    if (!user || !user.mfaSecret) {
      return false;
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
    });

    if (verified) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { mfaEnabled: true },
      });
    }

    return verified;
  }
}
