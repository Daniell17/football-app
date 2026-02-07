import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/shared';
import { Prisma } from '@prisma/client';

interface MatchRevenue {
  match: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    matchDate: Date;
    competition: string;
  };
  totalRevenue: number;
  ticketsSold: number;
  orders: number;
}

interface SalesTrend {
  date: string;
  revenue: number;
  orders: number;
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get overall ticket sales overview
   */
  async getTicketSalesOverview() {
    const [totalRevenue, totalTickets, totalOrders, paymentStats] = await Promise.all([
      // Total revenue
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      
      // Total tickets sold
      this.prisma.ticket.aggregate({
        where: { status: 'PAID' },
        _sum: { quantity: true },
      }),

      // Total orders
      this.prisma.payment.count({
        where: { status: 'COMPLETED' },
      }),

      // Payment status distribution
      this.prisma.payment.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      totalTicketsSold: totalTickets._sum.quantity || 0,
      totalOrders,
      paymentStatusDistribution: paymentStats.map(stat => ({
        status: stat.status,
        count: stat._count.id,
        totalAmount: stat._sum.amount || 0,
      })),
    };
  }

  /**
   * Get revenue by match
   */
  async getRevenueByMatch() {
    const tickets = await this.prisma.ticket.findMany({
      where: { status: 'PAID' },
      include: {
        match: {
          select: {
            id: true,
            homeTeam: true,
            awayTeam: true,
            matchDate: true,
            competition: true,
          },
        },
      },
    });

    const revenueByMatch = tickets.reduce((acc, ticket) => {
      const matchId = ticket.matchId;
      if (!acc[matchId]) {
        acc[matchId] = {
          match: ticket.match,
          totalRevenue: 0,
          ticketsSold: 0,
          orders: 0,
        };
      }
      acc[matchId].totalRevenue += ticket.totalPaid;
      acc[matchId].ticketsSold += ticket.quantity;
      acc[matchId].orders += 1;
      return acc;
    }, {} as Record<string, MatchRevenue>);

    return Object.values(revenueByMatch).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  /**
   * Get sales trends over time
   */
  async getSalesTrends(startDate?: Date, endDate?: Date) {
    const where: Prisma.PaymentWhereInput = { status: 'COMPLETED' };
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const payments = await this.prisma.payment.findMany({
      where,
      select: {
        createdAt: true,
        amount: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const trendsByDate = payments.reduce((acc, payment) => {
      const date = payment.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          revenue: 0,
          orders: 0,
        };
      }
      acc[date].revenue += payment.amount;
      acc[date].orders += 1;
      return acc;
    }, {} as Record<string, SalesTrend>);

    return Object.values(trendsByDate);
  }

  /**
   * Get match-specific analytics
   */
  async getMatchAnalytics(matchId: string) {
    const [match, tickets, revenue] = await Promise.all([
      this.prisma.match.findUnique({
        where: { id: matchId },
      }),

      this.prisma.ticket.aggregate({
        where: { matchId, status: 'PAID' },
        _sum: { quantity: true },
        _count: { id: true },
      }),

      this.prisma.ticket.aggregate({
        where: { matchId, status: 'PAID' },
        _sum: { totalPaid: true },
      }),
    ]);

    if (!match) {
      return null;
    }

    const availableTickets = match.totalTickets - match.ticketsSold;
    const soldPercentage = (match.ticketsSold / match.totalTickets) * 100;

    return {
      match: {
        id: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        matchDate: match.matchDate,
        competition: match.competition,
        venue: match.venue,
      },
      ticketsSold: tickets._sum.quantity || 0,
      totalOrders: tickets._count.id,
      totalRevenue: revenue._sum.totalPaid || 0,
      availableTickets,
      soldPercentage: Math.round(soldPercentage * 100) / 100,
      ticketPrice: match.ticketPrice,
    };
  }

  /**
   * Get payment method statistics
   */
  async getPaymentMethodStats() {
    const stats = await this.prisma.payment.groupBy({
      by: ['paymentMethod'],
      where: { status: 'COMPLETED' },
      _count: { id: true },
      _sum: { amount: true },
    });

    return stats.map(stat => ({
      method: stat.paymentMethod,
      count: stat._count.id,
      totalAmount: stat._sum.amount || 0,
    }));
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(limit: number = 10) {
    return this.prisma.payment.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        tickets: {
          include: {
            match: {
              select: {
                homeTeam: true,
                awayTeam: true,
                matchDate: true,
              },
            },
          },
        },
      },
    });
  }
}
