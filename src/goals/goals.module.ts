import {Module} from '@nestjs/common';
import { Goals } from './goals.model';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { DataProviderService } from '../data-provider/data-provider.service';

@Module({
    imports: [
        SequelizeModule.forFeature([Goals]),
    ],
    controllers: [GoalsController],
    providers: [GoalsService, DataProviderService],
})

export class GoalsModule {}