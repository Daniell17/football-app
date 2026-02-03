import { Injectable, OnModuleInit } from '@nestjs/common';
import { RateLimiterMemory } from 'rate-limiter-flexible';

@Injectable()
export class RateLimiterService implements OnModuleInit {
  public rateLimiter: RateLimiterMemory;

  onModuleInit() {
    this.rateLimiter = new RateLimiterMemory({
      keyPrefix: 'auth_fails',
      points: 5, // 5 attempts
      duration: 60, // per 60 seconds
      blockDuration: 60 * 15, // Block for 15 minutes if consumed
    });
  }
}
