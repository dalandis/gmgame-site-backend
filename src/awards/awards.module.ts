import {Module} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../users/users.model';
import { AwardsController } from './awards.controller';
import { Awards } from './awards.model';
import { AwardsService } from './awards.service';
import { DataProviderService } from '../data-provider/data-provider.service';

@Module({
    imports: [
        SequelizeModule.forFeature([Awards, User])
    ],
    controllers: [AwardsController],
    providers: [AwardsService, DataProviderService],
})

export class AwardsModule {}