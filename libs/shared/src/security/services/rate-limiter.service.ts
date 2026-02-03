import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

@Injectable()
export class RateLimiterService implements OnModuleInit, OnModuleDestroy {
  public rateLimiter: RateLimiterRedis;
  private redisClient: Redis;

  onModuleInit() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      enableOfflineQueue: false,
    });

    this.rateLimiter = new RateLimiterRedis({
      storeClient: this.redisClient,
      keyPrefix: 'auth_fails',
      points: 5, // 5 attempts
      duration: 60, // per 60 seconds
      blockDuration: 60 * 15, // Block for 15 minutes if consumed
    });
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }
}
