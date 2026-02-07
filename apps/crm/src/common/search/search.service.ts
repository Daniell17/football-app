import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/shared';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string) {
    if (!query || query.length < 2) {
      return {
        matches: [],
        players: [],
        news: [],
        users: [],
      };
    }

    const [matches, players, news, users] = await Promise.all([
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

      // Search Players
      this.prisma.player.findMany({
        where: {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { nationality: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),

      // Search News
      this.prisma.news.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        orderBy: { publishedAt: 'desc' },
      }),

      // Search Users
      this.prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: query, mode: 'insensitive' } },
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      }),
    ]);

    return {
      matches,
      players,
      news,
      users,
      totalResults: matches.length + players.length + news.length + users.length,
    };
  }
}
