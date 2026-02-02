import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/shared';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.news.findMany({
      where: { publishedAt: { lte: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
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
