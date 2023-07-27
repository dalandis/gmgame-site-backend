import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { User } from './users/users.model';
import { UsersModule } from './users/users.module';
import { TerritoriesModule } from './territories/territories.module';
import { MarkersModule } from './markers/markers.module';
import { AwardsModule } from './awards/awards.module';
import { ExternalApiModule } from './external-api/external-api.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { StatisticsModule } from './statistics/statistics.module';
import { ShopsModule } from './shops/shops.module';
import { AdminModule } from './admin/admin.module';
import { BullModule } from '@nestjs/bull';
import { ProcessQueuesModule } from './process-queues/process-queues.module';
import { LogsModule } from './logs/logs.module';
import { CronTasksModule } from './cron/cron.module';
import { ScheduleModule } from '@nestjs/schedule';
import { FaqModule } from './faq/faq.module'
import { GoalsModule } from './goals/goals.module';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '../../..', 'gmgame-site', 'build'),
            // serveRoot: '/(.*)',
            // exclude: ['/admin/(.*)'],
        }),
        ConfigModule.forRoot({
            envFilePath: '.env'
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
        ShopsModule,
        AdminModule,
        ProcessQueuesModule,
        LogsModule,
        CronTasksModule,
        FaqModule,
        GoalsModule,
        ScheduleModule.forRoot(),
        SequelizeModule.forRootAsync({
            useFactory: () => ({
                dialect: 'mysql',
                host: process.env.MYSQL_HOST,
                port: Number(process.env.MYSQL_PORT) || 3306,
                username: process.env.MYSQL_DB_USER,
                password: process.env.MYSQL_DB_PASSWORD,
                database: process.env.MYSQL_DB_NAME,
                autoLoadModels: true,
                logging: console.log
            })
        }),
    ],
    controllers: [AppController, AuthController],
    providers: [AppService],
})
export class AppModule {}

// export class AppModule implements NestModule {

//     public configure(consumer: MiddlewareConsumer) {
  
//         consumer.apply(LdapMiddleware).
//         exclude({path: 'api/', method: RequestMethod.ALL},
//                 {path: 'auth/google/callback', method: RequestMethod.ALL},
//                 {path: 'config.json', method: RequestMethod.ALL}).
//         forRoutes(AppController);
    
//         consumer.apply(RouteLoggingMiddleware).forRoutes(UsersController);
//         consumer.apply(RouteLoggingMiddleware).forRoutes(RolesController);
//     }
  
//   }
