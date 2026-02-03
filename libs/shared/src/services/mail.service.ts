import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendPasswordResetEmail(email: string, token: string) {
    // In a real app, use a provider like SendGrid or AWS SES
    // For now, we mock it and log the token to the console
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    
    this.logger.log(`====================================================`);
    this.logger.log(`Password Reset Request for: ${email}`);
    this.logger.log(`Reset Token: ${token}`);
    this.logger.log(`Reset Link (Frontend): ${resetLink}`);
    this.logger.log(`====================================================`);
    
    return true;
  }
}
