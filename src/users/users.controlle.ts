import { Controller, Get, UseGuards, Request, Response, Post, Body, HttpStatus, SetMetadata } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { CreateUserDto, ChangePasswordDto } from '../validator/create.user';
import { UtilsService } from '../Utils/utils.service';
import { RoleGuard } from '../auth/roles/api-roles';

@Controller('/api')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly utilsService: UtilsService
    ) {}

    @UseGuards(AuthenticatedGuard)
    @Get('/profile')
    async profile(@Request() req, @Response() res): Promise<any> {
        const user = await this.usersService.getUser(req.user.id);

        if (user?.status !== req.session.passport.user.localuser.status) {
            req.session.passport.user.localuser.status = user?.status;
        }

        res.send({
            discordUser: req.user,
            user: user,
            status: await this.utilsService.getStatus(user?.status || 0),
            version: '1.19.2'
        });
    }

    @UseGuards(AuthenticatedGuard)
    @Post('/registration_user')
    async regUser(@Request() req, @Body() body: CreateUserDto, @Response() res): Promise<any> {
        const message = await this.usersService.addUser(body, req.user)
 
        res.send(JSON.stringify(message));
    }

    @SetMetadata('role', 'player')
    @UseGuards(AuthenticatedGuard, RoleGuard)
    @Post('/change_password')
    async changePassword(@Request() req, @Body() body: ChangePasswordDto, @Response() res): Promise<any> {
        const message = await this.usersService.changePassword(body, req.user)

        res.send(JSON.stringify(message));
    }
}