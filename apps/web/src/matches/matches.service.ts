import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/shared';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.match.findMany({
      orderBy: { matchDate: 'desc' },
    });
  }

  async findUpcoming() {
    return this.prisma.match.findMany({
      where: { status: 'SCHEDULED' },
      orderBy: { matchDate: 'asc' },
    });
  }

  async findFinished() {
    return this.prisma.match.findMany({
      where: { status: 'FINISHED' },
      orderBy: { matchDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
    });
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    return match;
  }
}
