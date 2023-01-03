import { Module } from '@nestjs/common';
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

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env'
        }),
        AuthModule,
        ExternalApiModule,
        UsersModule,
        TerritoriesModule,
        MarkersModule,
        AwardsModule,
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
