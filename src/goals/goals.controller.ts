import { Controller, Get, UseGuards, Request, Response, Param, Post, Body, HttpStatus, SetMetadata } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { saveGoalsDto } from '../validator/goals';
import { RoleGuard } from '../auth/roles/api-roles';

@Controller('/api')
export class GoalsController {
    constructor(
        private readonly goalsService: GoalsService
    ) {}
    
    @SetMetadata('role', 'admin')
    @UseGuards(AuthenticatedGuard, RoleGuard)
    @Post('/save_goal')
    async saveFaq(@Request() req, @Response() res, @Body() body: saveGoalsDto): Promise<any> {
        const message = await this.goalsService.saveGoal(body);

        res.send(JSON.stringify(message)); 
    }

    @Get('/get_goals')
    async getGoals(@Request() req, @Response() res): Promise<any> {
        const goals = await this.goalsService.getGoals();

        res.send(JSON.stringify(goals)); 
    }
}