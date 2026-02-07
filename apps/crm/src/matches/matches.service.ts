import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService, MatchSelect, PaginatedResponse, buildPrismaQuery, getPaginationMeta } from '@app/shared';
import { Prisma, Match } from '@prisma/client';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchFilterDto } from './dto/match-filter.dto';

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

  async findAll(query: MatchFilterDto): Promise<PaginatedResponse<Match>> {
    const { status, fromDate, toDate, competition, ...paginationQuery } = query;

    // Build filters
    const filters: Prisma.MatchWhereInput = {};
    if (status) filters.status = status;
    if (competition) filters.competition = { contains: competition, mode: 'insensitive' };
    
    if (fromDate || toDate) {
      filters.matchDate = {};
      if (fromDate) filters.matchDate.gte = new Date(fromDate);
      if (toDate) filters.matchDate.lte = new Date(toDate);
    }

    const prismaQuery = buildPrismaQuery(
      paginationQuery,
      ['homeTeam', 'awayTeam', 'venue', 'competition'], // Searchable fields
      filters
    );

    const [data, total] = await Promise.all([
      this.prisma.match.findMany({
        ...prismaQuery,
        select: MatchSelect,
      }),
      this.prisma.match.count({ where: prismaQuery.where }),
    ]);

    return {
      data,
      meta: getPaginationMeta(total, query.page || 1, query.limit || 10),
    };
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
