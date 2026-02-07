import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/shared';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string) {
    if (!query || query.length < 2) {
      return {
        matches: [],
        news: [],
      };
    }

    const [matches, news] = await Promise.all([
      // Search Matches
      this.prisma.match.findMany({
        where: {
          OR: [
            { homeTeam: { contains: query, mode: 'insensitive' } },
            { awayTeam: { contains: query, mode: 'insensitive' } },
            { venue: { contains: query, mode: 'insensitive' } },
            { competition: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        orderBy: { matchDate: 'desc' },
      }),

      // Search News
      this.prisma.news.findMany({
        where: {
          publishedAt: { lte: new Date() },
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        orderBy: { publishedAt: 'desc' },
      }),
    ]);

    return {
      matches,
      news,
      totalResults: matches.length + news.length,
    };
  }
}
