import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@app/shared';
import { UserRole } from '@prisma/client';

@ApiTags('analytics')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get overall ticket sales overview' })
  async getOverview() {
    return this.analyticsService.getTicketSalesOverview();
  }

  @Get('revenue/by-match')
  @ApiOperation({ summary: 'Get revenue breakdown by match' })
  async getRevenueByMatch() {
    return this.analyticsService.getRevenueByMatch();
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get sales trends over time' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getSalesTrends(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getSalesTrends(start, end);
  }

  @Get('matches/:id')
  @ApiOperation({ summary: 'Get analytics for a specific match' })
  async getMatchAnalytics(@Param('id') matchId: string) {
    return this.analyticsService.getMatchAnalytics(matchId);
  }

  @Get('payment-methods')
  @ApiOperation({ summary: 'Get payment method statistics' })
  async getPaymentMethodStats() {
    return this.analyticsService.getPaymentMethodStats();
  }

  @Get('transactions/recent')
  @ApiOperation({ summary: 'Get recent transactions' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentTransactions(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.analyticsService.getRecentTransactions(limitNum);
  }
}
