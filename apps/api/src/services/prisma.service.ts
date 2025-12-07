import {Injectable, OnModuleDestroy, OnModuleInit, Logger} from '@nestjs/common';
import {PrismaClient} from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['error', 'warn'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      this.logger.error('❌ DATABASE_URL environment variable is not set!');
      this.logger.error('Please set DATABASE_URL in your Railway service variables.');
      this.logger.error('Go to: Railway Dashboard → Your Service → Variables → Add DATABASE_URL');
      throw new Error('DATABASE_URL environment variable is required');
    }

    try {
      await this.$connect();
      this.logger.log('✅ Successfully connected to database');
    } catch (error) {
      this.logger.error('❌ Failed to connect to database');
      this.logger.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
      this.logger.error('Please check:');
      this.logger.error('1. DATABASE_URL is correct');
      this.logger.error('2. Database service is running');
      this.logger.error('3. Network connectivity to database');
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }
}

