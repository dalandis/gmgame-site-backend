import { Controller, Get, UseGuards, Request, Response } from '@nestjs/common';
import { AppService } from './app.service';
import {AuthenticatedGuard} from './auth/guards/authenticated.guard';

@Controller('/api')
export class AppController {
    constructor(private readonly appService: AppService) {}

    // @Get('/')
    // async getHello(@Request() req): Promise<{discordUser: Record<string,string>}> {
    //     return {discordUser: req.user};
    // }
}
