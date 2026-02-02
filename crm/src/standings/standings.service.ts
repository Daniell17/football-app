import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/shared';
import { CreateStandingDto } from './dto/create-standing.dto';
import { UpdateStandingDto } from './dto/update-standing.dto';

@Injectable()
export class StandingsService {
  constructor(private prisma: PrismaService) {}

  async create(createStandingDto: CreateStandingDto) {
    return this.prisma.teamStanding.create({
      data: createStandingDto,
    });
  }

  async findAll() {
    return this.prisma.teamStanding.findMany({
      orderBy: { points: 'desc' },
    });
  }

  async findOne(id: string) {
    const standing = await this.prisma.teamStanding.findUnique({
      where: { id },
    });
    if (!standing) {
      throw new NotFoundException(`Standing with ID ${id} not found`);
    }
    return standing;
  }

  async update(id: string, updateStandingDto: UpdateStandingDto) {
    await this.findOne(id);
    return this.prisma.teamStanding.update({
      where: { id },
      data: updateStandingDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.teamStanding.delete({
      where: { id },
    });
  }
}
