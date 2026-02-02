import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/shared';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async create(createHistoryDto: CreateHistoryDto) {
    return this.prisma.history.create({
      data: createHistoryDto,
    });
  }

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

  async update(id: string, updateHistoryDto: UpdateHistoryDto) {
    await this.findOne(id);
    return this.prisma.history.update({
      where: { id },
      data: updateHistoryDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.history.delete({
      where: { id },
    });
  }
}
