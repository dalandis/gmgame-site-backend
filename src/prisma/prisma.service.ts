import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }

  async onModuleInit() {
    console.log('Connecting to the database');
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
