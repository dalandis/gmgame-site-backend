import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { UsersModule } from './users/users.module';
import { TerritoriesModule } from './territories/territories.module';
import { MarkersModule } from './markers/markers.module';
import { AwardsModule } from './awards/awards.module';
import { ExternalApiModule } from './external-api/external-api.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { StatisticsModule } from './statistics/statistics.module';
import { AdminModule } from './admin/admin.module';
import { BullModule } from '@nestjs/bull';
import { ProcessQueuesModule } from './process-queues/process-queues.module';
import { LogsModule } from './logs/logs.module';
import { CronTasksModule } from './cron/cron.module';
import { ScheduleModule } from '@nestjs/schedule';
import { FaqModule } from './faq/faq.module';
import { GoalsModule } from './goals/goals.module';
import { TicketsModule } from './tickets/tickets.module';
import { GalleryModule } from './gallery/gallery.module';
import { PrismaModule } from './prisma/prisma.module';
import { ShopModule } from './shop/shop.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../..', 'gmgame-site', 'build'),
      // serveRoot: '/(.*)',
      // exclude: ['/admin/(.*)'],
    }),
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    AuthModule,
    ExternalApiModule,
    UsersModule,
    TerritoriesModule,
    MarkersModule,
    AwardsModule,
    StatisticsModule,
    ShopModule,
    AdminModule,
    ProcessQueuesModule,
    LogsModule,
    CronTasksModule,
    FaqModule,
    GoalsModule,
    TicketsModule,
    GalleryModule,
    ScheduleModule.forRoot(),
    PrismaModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}
