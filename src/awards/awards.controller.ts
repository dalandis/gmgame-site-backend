import { Controller, Get, UseGuards, Request, Response, Post, Body, SetMetadata } from '@nestjs/common';
import { AwardsService } from './awards.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { rewardsDto } from '../validator/give.rewards';
import { RoleGuard } from '../auth/roles/api-roles';

@Controller('/api')
export class AwardsController {
    constructor(
        private readonly awardsService: AwardsService
    ) {}

    @SetMetadata('role', 'player')
    @UseGuards(AuthenticatedGuard, RoleGuard)
    @Get('/get_awards')
    async getAwards(@Request() req, @Response() res): Promise<any> {
        const awards = await this.awardsService.getAwards(req.user.id);

        res.send({
            count: awards.length,
            awards: awards
        });
    }

    @SetMetadata('role', 'player')
    @UseGuards(AuthenticatedGuard, RoleGuard)
    @Post('/give_reward')
    async giveReward(@Request() req, @Response() res, @Body() body: rewardsDto): Promise<any> {
        const awards = await this.awardsService.giveReward(body, req.user.id);

        res.send(JSON.stringify(awards));
    }
}
