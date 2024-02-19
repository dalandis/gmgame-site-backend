import {Module} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DonateStatusController } from './donate-status.controlle';
import { DonateStatus } from './donate-status.model';
import { DonateStatusService } from './donate-status.service';
import { UtilsService } from '../Utils/utils.service';

@Module({
    imports: [
        SequelizeModule.forFeature([DonateStatus])
    ],
    controllers: [DonateStatusController],
    providers: [DonateStatusService, UtilsService],
})

export class DonateStatusModule {}