import { Controller, UseGuards, Request, Response, Post, Body, HttpStatus, SetMetadata } from '@nestjs/common';
import { UserAdminService } from './users.service';
import { getUserDto } from '../../validator/admin/users-admin';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';

@Controller('/api/admin')
export class UserAdminController {
    constructor(
        private readonly userAdminService: UserAdminService
    ) {}
    
    @SetMetadata('role', 'admin')
    @UseGuards(AuthenticatedGuard)
    @Post('/get_user')
    async createUser(@Request() req, @Response() res, @Body() body: getUserDto): Promise<any> {
        const response = await this.userAdminService.getUser(body);

        res.send(JSON.stringify(response));
    }
}

