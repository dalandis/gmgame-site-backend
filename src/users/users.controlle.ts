import { Controller, Get, UseGuards, Request, Response, Post, Body, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { CreateUserDto } from '../validator/create.user';

@Controller('/api')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(AuthenticatedGuard)
    @Get('/profile')
    async profile(@Request() req, @Response() res): Promise<any> {
        const user = await this.usersService.getUser(req.user.id);

        res.send({
            discordUser: req.user,
            user: user
        });
    }

    @UseGuards(AuthenticatedGuard)
    @Post('/registration_user')
    async regUser(@Request() req, @Body() body: CreateUserDto, @Response() res): Promise<any> {
        
        const message = await this.usersService.addUser(body, req.user)
        console.log(message);
        res.send(JSON.stringify(message));
    }
}