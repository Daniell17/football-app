import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { PurchaseTicketDto } from './dto/purchase-ticket.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, GetUser, PoliciesGuard, CheckPolicies } from '@app/shared';

@ApiTags('tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PoliciesGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('purchase')
  @ApiOperation({ summary: 'Purchase tickets for a match' })
  async purchase(
    @GetUser('id') userId: string,
    @Body() purchaseTicketDto: PurchaseTicketDto,
  ) {
    return this.ticketsService.purchase(userId, purchaseTicketDto);
  }

  @Get('my-tickets')
  @CheckPolicies((ability) => ability.can('read', 'Ticket'))
  @ApiOperation({ summary: 'Get list of tickets purchased by current user' })
  async getMyTickets(@GetUser('id') userId: string) {
    return this.ticketsService.getMyTickets(userId);
  }
}
