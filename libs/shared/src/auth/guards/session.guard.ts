import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.version === undefined) {
      return true;
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id || user.userId || user.sub },
      select: { tokenVersion: true },
    });

    if (!dbUser || dbUser.tokenVersion !== user.version) {
      throw new UnauthorizedException('Session expired or invalidated');
    }

    return true;
  }
}
