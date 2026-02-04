import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService, MatchSelect } from '@app/shared';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  async create(createMatchDto: CreateMatchDto) {
    const { createNews, newsDescription, newsImage, ...matchData } = createMatchDto;

    const match = await this.prisma.match.create({
      data: matchData,
    });

    if (createNews) {
      await this.prisma.news.create({
        data: {
          title: `New Match: ${match.homeTeam} vs ${match.awayTeam}`,
          content: newsDescription || '',
          imageUrl: newsImage,
          isFeatured: true,
        },
      });
    }

    return match;
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
    const { createNews, newsDescription, newsImage, ...updateData } = updateMatchDto;
    
    return this.prisma.match.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.match.delete({
      where: { id },
    });
  }
}
