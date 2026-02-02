import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/shared';
import { PurchaseTicketDto } from './dto/purchase-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async purchase(userId: string, purchaseTicketDto: PurchaseTicketDto) {
    const { matchId, quantity } = purchaseTicketDto;

    // 1. Check if match exists and has enough tickets
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    if (match.status === 'FINISHED') {
      throw new BadRequestException('Cannot purchase tickets for a finished match');
    }

    const availableTickets = match.totalTickets - match.ticketsSold;
    if (availableTickets < quantity) {
      throw new BadRequestException(`Only ${availableTickets} tickets available`);
    }

    // 2. Use a transaction to update match and create ticket
    return this.prisma.$transaction(async (tx) => {
      // Update tickets sold
      const updatedMatch = await tx.match.update({
        where: { id: matchId },
        data: {
          ticketsSold: {
            increment: quantity,
          },
        },
      });

      // Compute total price
      const totalPaid = match.ticketPrice * quantity;

      // Create ticket
      const ticket = await tx.ticket.create({
        data: {
          userId,
          matchId,
          quantity,
          totalPaid,
          status: 'PAID',
        },
        include: {
          match: true,
        },
      });

      return ticket;
    });
  }

  async getMyTickets(userId: string) {
    return this.prisma.ticket.findMany({
      where: { userId },
      include: {
        match: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
