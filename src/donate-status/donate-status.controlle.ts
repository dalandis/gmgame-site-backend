import { Controller, Get, Request, Response} from '@nestjs/common';
import { DonateStatusService } from './donate-status.service';

@Controller('/api')
export class DonateStatusController {
    constructor(
        private readonly donateStatusService: DonateStatusService
    ) {}

    @Get('/get_donate_status')
    async getDonateStatus(@Request() req, @Response() res): Promise<any> {
        const dataStatus = await this.donateStatusService.getDonateStatus();

        res.send({
            length: dataStatus.length,
            data: dataStatus
        });
    }
}