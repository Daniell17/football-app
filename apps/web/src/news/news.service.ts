import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService, PaginatedResponse, buildPrismaQuery, getPaginationMeta } from '@app/shared';
import { Prisma, News } from '@prisma/client';
import { NewsFilterDto } from './dto/news-filter.dto';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: NewsFilterDto): Promise<PaginatedResponse<News>> {
    const { isFeatured, ...paginationQuery } = query;

    const filters: Prisma.NewsWhereInput = {
      publishedAt: { lte: new Date() }, // Only public news
    };
    
    if (isFeatured !== undefined) {
      filters.isFeatured = isFeatured;
    }

    const prismaQuery = buildPrismaQuery(
      paginationQuery,
      ['title', 'content'], // Searchable fields
      filters
    );

    const [data, total] = await Promise.all([
      this.prisma.news.findMany({
        ...prismaQuery,
      }),
      this.prisma.news.count({ where: prismaQuery.where }),
    ]);

    return {
      data,
      meta: getPaginationMeta(total, query.page || 1, query.limit || 10),
    };
  }

  async findOne(id: string) {
    const news = await this.prisma.news.findUnique({
      where: { id },
    });
    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }
    return news;
  }

  async findFeatured() {
    return this.prisma.news.findMany({
      where: { isFeatured: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
  }
}
