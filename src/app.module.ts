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
import {ServeStaticModule} from '@nestjs/serve-static';
import { join } from 'path';
import { StatisticsModule } from './statistics/statistics.module';
import { ShopsModule } from './shops/shops.module';
import { AdminModule } from './admin/admin.module';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '../..', 'gmgame-site', 'build')
        }),
        ConfigModule.forRoot({
            envFilePath: '.env'
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
        SequelizeModule.forRootAsync({
            useFactory: () => ({
                dialect: 'mysql',
                host: process.env.MYSQL_HOST,
                port: 3306,
                username: process.env.MYSQL_DB_USER,
                password: process.env.MYSQL_DB_PASSWORD,
                database: process.env.MYSQL_DB_NAME,
                models: [User],
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
