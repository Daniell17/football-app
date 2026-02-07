import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService, PaginatedResponse, buildPrismaQuery, getPaginationMeta } from '@app/shared';
import { Prisma, Match } from '@prisma/client';
import { MatchFilterDto } from './dto/match-filter.dto';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: MatchFilterDto): Promise<PaginatedResponse<Match>> {
    const { status, competition, ...paginationQuery } = query;

    const filters: Prisma.MatchWhereInput = {};
    if (status) filters.status = status;
    if (competition) filters.competition = { contains: competition, mode: 'insensitive' };

    const prismaQuery = buildPrismaQuery(
      paginationQuery,
      ['homeTeam', 'awayTeam', 'venue', 'competition'], // Searchable fields
      filters
    );

    const [data, total] = await Promise.all([
      this.prisma.match.findMany({
        ...prismaQuery,
      }),
      this.prisma.match.count({ where: prismaQuery.where }),
    ]);

    return {
      data,
      meta: getPaginationMeta(total, query.page || 1, query.limit || 10),
    };
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
