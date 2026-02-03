import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { RateLimiterService } from '../services/rate-limiter.service';

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  constructor(private readonly rateLimiterService: RateLimiterService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = request.ip; // Rate limit by IP

    try {
      await this.rateLimiterService.rateLimiter.consume(key);
      return true;
    } catch (res) {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }
  }
}
