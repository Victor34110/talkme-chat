import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@repo/types/server';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient {
  private pool: Pool;
  constructor() {
    const pool = new Pool({
      connectionString:
        'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
    });

    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: ['query', 'error', 'warn'],
    });

    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
