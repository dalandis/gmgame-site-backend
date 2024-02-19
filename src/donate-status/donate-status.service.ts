import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DonateStatus } from './donate-status.model';

@Injectable()
export class DonateStatusService {
    constructor(
        @InjectModel(DonateStatus)
        private donateStatusModel: typeof DonateStatus
    ) {}

    async getDonateStatus(): Promise<DonateStatus[]> {
        return this.donateStatusModel.findAll();
    }
}
