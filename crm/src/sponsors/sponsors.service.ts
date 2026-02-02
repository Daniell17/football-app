import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/shared';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';

@Injectable()
export class SponsorsService {
  constructor(private prisma: PrismaService) {}

  async create(createSponsorDto: CreateSponsorDto) {
    return this.prisma.sponsor.create({
      data: createSponsorDto,
    });
  }

  async findAll() {
    return this.prisma.sponsor.findMany({
      orderBy: [{ tier: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const sponsor = await this.prisma.sponsor.findUnique({
      where: { id },
    });
    if (!sponsor) {
      throw new NotFoundException(`Sponsor with ID ${id} not found`);
    }
    return sponsor;
  }

  async update(id: string, updateSponsorDto: UpdateSponsorDto) {
    await this.findOne(id);
    return this.prisma.sponsor.update({
      where: { id },
      data: updateSponsorDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.sponsor.delete({
      where: { id },
    });
  }
}
