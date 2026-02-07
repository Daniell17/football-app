import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService, PaymentService } from '@app/shared';
import { PurchaseTicketDto } from './dto/purchase-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private paymentService: PaymentService,
  ) {}

  /**
   * Initialize payment for ticket purchase
   */
  async initializePayment(userId: string, purchaseTicketDto: PurchaseTicketDto, userEmail: string) {
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

    // 2. Calculate total amount
    const totalAmount = match.ticketPrice * quantity;

    // 3. Generate unique order ID
    const orderId = `TICKET-${Date.now()}-${userId.substring(0, 8)}`;

    // 4. Create payment record
    const payment = await this.paymentService.createPayment(userId, totalAmount, orderId, {
      matchId,
      quantity,
      matchTitle: `${match.homeTeam} vs ${match.awayTeam}`,
    });

    // 5. Create pending ticket
    await this.prisma.ticket.create({
      data: {
        userId,
        matchId,
        quantity,
        totalPaid: totalAmount,
        status: 'PENDING',
        paymentId: payment.id,
        paymentStatus: 'PENDING',
      },
    });

    // 6. Generate Paysera payment URL
    const baseUrl = process.env.WEB_APP_URL || 'http://localhost:8080';
    const paymentUrl = this.paymentService.generatePaymentUrl({
      projectid: process.env.PAYSERA_PROJECT_ID || '',
      orderid: orderId,
      accepturl: `${baseUrl}/tickets/payment/success`,
      cancelurl: `${baseUrl}/tickets/payment/cancel`,
      callbackurl: `${baseUrl}/tickets/payment/callback`,
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'EUR',
      test: process.env.NODE_ENV === 'production' ? 0 : 1,
      p_email: userEmail,
    });

    return {
      paymentUrl,
      orderId,
      amount: totalAmount,
      currency: 'EUR',
    };
  }

  /**
   * Confirm payment and complete ticket purchase
   */
  async confirmPayment(orderId: string, data: string, signature: string) {
    // 1. Verify signature
    const isValid = this.paymentService.verifyCallback(data, signature);
    if (!isValid) {
      throw new BadRequestException('Invalid payment signature');
    }

    // 2. Decode callback data
    const callbackData = this.paymentService.decodeCallbackData(data);

    // 3. Get payment
    const payment = await this.paymentService.getPaymentByOrderId(orderId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // 4. Check payment status from callback
    const paymentStatus = callbackData.status;

    if (paymentStatus === '1') {
      // Payment successful
      return this.prisma.$transaction(async (tx) => {
        // Update payment
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            payseraData: data,
            payseraSignature: signature,
            completedAt: new Date(),
          },
        });

        // Update ticket
        const ticket = await tx.ticket.findFirst({
          where: { paymentId: payment.id },
          include: { match: true },
        });

        if (ticket) {
          await tx.ticket.update({
            where: { id: ticket.id },
            data: {
              status: 'PAID',
              paymentStatus: 'COMPLETED',
            },
          });

          // Update match tickets sold
          await tx.match.update({
            where: { id: ticket.matchId },
            data: {
              ticketsSold: {
                increment: ticket.quantity,
              },
            },
          });
        }

        return { success: true, status: 'COMPLETED' };
      });
    } else {
      // Payment failed
      await this.prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            payseraData: data,
            payseraSignature: signature,
          },
        });

        await tx.ticket.updateMany({
          where: { paymentId: payment.id },
          data: {
            status: 'CANCELLED',
            paymentStatus: 'FAILED',
          },
        });
      });

      return { success: false, status: 'FAILED' };
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(orderId: string) {
    const payment = await this.paymentService.getPaymentByOrderId(orderId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return {
      orderId: payment.orderId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
    };
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
