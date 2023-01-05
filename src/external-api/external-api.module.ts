import {Module} from '@nestjs/common';
import { User } from '../users/users.model';
import { Awards } from '../awards/awards.model';
import { ExternalApiController } from './external-api.controller';
import { ExternalApiService } from './external-api.service';
import { UsersModule } from '../users/users.module';
import { UtilsService } from '../Utils/utils.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { DataProviderService } from '../data-provider/data-provider.service';

@Module({
    imports: [
        UsersModule,
        SequelizeModule.forFeature([User, Awards])
    ],
    controllers: [ExternalApiController],
    providers: [ExternalApiService, UtilsService, DataProviderService],
})

export class ExternalApiModule {}