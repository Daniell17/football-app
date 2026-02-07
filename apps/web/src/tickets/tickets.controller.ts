import { Controller, Post, Body, UseGuards, Get, Query, Param } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { PurchaseTicketDto } from './dto/purchase-ticket.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, GetUser, PoliciesGuard, CheckPolicies } from '@app/shared';
import { User } from '@prisma/client';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize payment for ticket purchase' })
  async purchase(
    @GetUser() user: User,
    @Body() purchaseTicketDto: PurchaseTicketDto,
  ) {
    return this.ticketsService.initializePayment(user.id, purchaseTicketDto, user.email);
  }

  @Post('payment/callback')
  @ApiOperation({ summary: 'Paysera payment callback (webhook)' })
  async paymentCallback(
    @Query('data') data: string,
    @Query('ss1') signature: string,
  ) {
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const params: Record<string, string> = {};
    decodedData.split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      params[key] = decodeURIComponent(value);
    });

    return this.ticketsService.confirmPayment(params.orderid, data, signature);
  }

  @Get('payment/:orderId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check payment status' })
  async getPaymentStatus(@Param('orderId') orderId: string) {
    return this.ticketsService.getPaymentStatus(orderId);
  }

  @Get('my-tickets')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @ApiBearerAuth()
  @CheckPolicies((ability) => ability.can('read', 'Ticket'))
  @ApiOperation({ summary: 'Get list of tickets purchased by current user' })
  async getMyTickets(@GetUser('id') userId: string) {
    return this.ticketsService.getMyTickets(userId);
  }
}
