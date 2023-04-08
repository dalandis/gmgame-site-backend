import {Module} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
// import { User } from '../users/users.model';
// import { AwardsController } from './awards.controller';
import { Logs } from './logs.model';
import { LogsService } from './logs.service';
// import { AwardsService } from './awards.service';
// import { DataProviderService } from '../data-provider/data-provider.service';

@Module({
    imports: [
        SequelizeModule.forFeature([Logs])
    ],
    controllers: [],
    providers: [LogsService],
})

export class LogsModule {}