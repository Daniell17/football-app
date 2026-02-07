import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';

export interface PayseraPaymentRequest {
  projectid: string;
  orderid: string;
  accepturl: string;
  cancelurl: string;
  callbackurl: string;
  amount: number;
  currency: string;
  test: number;
  p_email?: string;
  p_firstname?: string;
  p_lastname?: string;
}

@Injectable()
export class PaymentService {
  private readonly payseraUrl = 'https://bank.paysera.com/pay/';
  private readonly projectId: string;
  private readonly signPassword: string;

  constructor(private prisma: PrismaService) {
    this.projectId = process.env.PAYSERA_PROJECT_ID || '';
    this.signPassword = process.env.PAYSERA_SIGN_PASSWORD || '';
  }

  /**
   * Generate Paysera payment URL
   */
  generatePaymentUrl(paymentRequest: PayseraPaymentRequest): string {
    const data = this.encodeData(paymentRequest);
    const signature = this.generateSignature(data);

    return `${this.payseraUrl}?data=${encodeURIComponent(data)}&sign=${encodeURIComponent(signature)}`;
  }

  /**
   * Encode payment data for Paysera
   */
  private encodeData(params: PayseraPaymentRequest): string {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    return Buffer.from(queryString).toString('base64');
  }

  /**
   * Generate MD5 signature for Paysera
   */
  private generateSignature(data: string): string {
    const signString = `${data}${this.signPassword}`;
    return crypto.createHash('md5').update(signString).digest('hex');
  }

  /**
   * Verify callback signature from Paysera
   */
  verifyCallback(data: string, signature: string): boolean {
    const expectedSignature = this.generateSignature(data);
    return expectedSignature === signature;
  }

  /**
   * Decode callback data from Paysera
   */
  decodeCallbackData(data: string): Record<string, string> {
    const decoded = Buffer.from(data, 'base64').toString('utf-8');
    const params: Record<string, string> = {};
    
    decoded.split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      params[key] = decodeURIComponent(value);
    });

    return params;
  }

  /**
   * Create payment record in database
   */
  async createPayment(userId: string, amount: number, orderId: string, metadata?: Prisma.InputJsonValue) {
    return this.prisma.payment.create({
      data: {
        userId,
        amount,
        orderId,
        currency: 'EUR',
        status: 'PENDING',
        paymentMethod: 'paysera',
        payseraProjectId: this.projectId,
        metadata,
      },
    });
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    orderId: string,
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED',
    payseraData?: string,
    payseraSignature?: string
  ) {
    return this.prisma.payment.update({
      where: { orderId },
      data: {
        status,
        payseraData,
        payseraSignature,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Get payment by order ID
   */
  async getPaymentByOrderId(orderId: string) {
    return this.prisma.payment.findUnique({
      where: { orderId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        tickets: true,
      },
    });
  }
}
