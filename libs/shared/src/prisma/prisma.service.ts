import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    console.log(`[PrismaService] Initializing. Database URL available: ${!!dbUrl}`);
    
    if (!dbUrl) {
      console.warn('[PrismaService] WARNING: DATABASE_URL is not defined in process.env!');
    }

    const pool = new Pool({ connectionString: dbUrl });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('[PrismaService] Successfully connected to database.');
    } catch (error) {
      console.error('[PrismaService] Failed to connect to database:', error.message);
      throw error;
    }
  }
}
