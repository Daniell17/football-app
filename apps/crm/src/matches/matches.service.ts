import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService, MatchSelect } from '@app/shared';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  async create(createMatchDto: CreateMatchDto) {
    return this.prisma.match.create({
      data: createMatchDto,
    });
  }

  async findAll() {
    return this.prisma.match.findMany({
      select: MatchSelect,
      orderBy: { matchDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      select: MatchSelect,
    });
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    return match;
  }

  async update(id: string, updateMatchDto: UpdateMatchDto) {
    await this.findOne(id);
    return this.prisma.match.update({
      where: { id },
      data: updateMatchDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.match.delete({
      where: { id },
    });
  }
}
