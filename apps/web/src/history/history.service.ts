import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/shared';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.history.findMany({
      orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const history = await this.prisma.history.findUnique({
      where: { id },
    });
    if (!history) {
      throw new NotFoundException(`History record with ID ${id} not found`);
    }
    return history;
  }
}
