import { Controller, Get, UseGuards, Request, Response } from '@nestjs/common';
import {LoginGuard} from './guards/login.guard';

@Controller('/api')
export class AuthController {
    constructor() {}

    @UseGuards(LoginGuard)
    @Get('/login')
    login(): void {}

    @UseGuards(LoginGuard)
    @Get('/callback')
    discordAuthCallback(@Request() req, @Response() res) {
        if (req.user) {
            res.redirect('/api/');
        } else {
            res.status(500);
        }
    }
}