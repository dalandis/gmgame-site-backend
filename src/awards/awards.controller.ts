import { Controller, Get, UseGuards, Request, Response, Post, Body } from '@nestjs/common';
import { AwardsService } from './awards.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { rewardsDto } from '../validator/give.rewards';

@Controller('/api')
export class AwardsController {
    constructor(
        private readonly awardsService: AwardsService
    ) {}

    @UseGuards(AuthenticatedGuard)
    @Get('/get_awards')
    async getAwards(@Request() req, @Response() res): Promise<any> {
        const awards = await this.awardsService.getAwards(req.user.id);

        res.send({
            count: awards.length,
            awards: awards
        });
    }

    @UseGuards(AuthenticatedGuard)
    @Post('/give_reward')
    async giveReward(@Request() req, @Response() res, @Body() body: rewardsDto): Promise<any> {
        const awards = await this.awardsService.giveReward(body, req.user.id);

        res.send(JSON.stringify(awards));
    }
}
