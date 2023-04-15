import { Controller, UseGuards, Request, Response, Post, Body, HttpStatus, SetMetadata } from '@nestjs/common';
import { ExternalApiService } from './external-api.service';
import { createUserDto, getStatusrDto, checkUserDto, decisionUserDto, eventUserDto } from '../validator/external-api/create-user';
import {LoginGuardBearer} from '../auth/guards/login.guard';
import {RoleGuard} from '../auth/roles/api-roles';
import { FormDataRequest } from 'nestjs-form-data';

@Controller('/api')
export class ExternalApiController {
    constructor(
        private readonly externalApiService: ExternalApiService
    ) {}
    
    @SetMetadata('role', 'superhub')
    @UseGuards(LoginGuardBearer, RoleGuard)
    @Post('/create_user')
    async createUser(@Request() req, @Response() res, @Body() body: createUserDto): Promise<any> {
        const response = await this.externalApiService.createUser(body, req.user.username);

        if (response.error) {
            res.status(HttpStatus.BAD_REQUEST).json(response);
            return;
        }

        res.send(JSON.stringify(response));
    }

    @SetMetadata('role', 'superhub')
    @UseGuards(LoginGuardBearer, RoleGuard)
    @Post('/get_status')
    async getStatus(@Request() req, @Response() res, @Body() body: getStatusrDto): Promise<any> {
        const response = await this.externalApiService.getStatus(body.user_id);

        if (response.error) {
            res.status(HttpStatus.BAD_REQUEST).json(response);
            return;
        }

        res.send(JSON.stringify(response));
    }

    @SetMetadata('role', 'bot')
    @UseGuards(LoginGuardBearer, RoleGuard)
    @Post('/check_user')
    async checkUser(@Request() req, @Response() res, @Body() body: checkUserDto): Promise<any> {
        const response = await this.externalApiService.checkUser(body);

        if (response.error) {
            res.status(HttpStatus.BAD_REQUEST).json(response);
            return;
        }

        res.send(JSON.stringify(response));
    }

    @SetMetadata('role', 'bot')
    @UseGuards(LoginGuardBearer, RoleGuard)
    @Post('/accept_user')
    async acceptUser(@Request() req, @Response() res, @Body() body: decisionUserDto): Promise<any> {
        const response = await this.externalApiService.acceptUser(body);

        if (response.error) {
            res.status(HttpStatus.BAD_REQUEST).json(response);
            return;
        }

        res.send(JSON.stringify(response));
    }

    @SetMetadata('role', 'bot')
    @UseGuards(LoginGuardBearer, RoleGuard)
    @Post('/deny_user')
    async denyUser(@Request() req, @Response() res, @Body() body: decisionUserDto): Promise<any> {
        const response = await this.externalApiService.denyUser(body);

        if (response.error) {
            res.status(HttpStatus.BAD_REQUEST).json(response);
            return;
        }

        res.send(JSON.stringify(response));
    }

    @Post('/vote_handler')
    @FormDataRequest()
    async voteHandler(@Request() req, @Response() res, @Body() body): Promise<any> {
        const response = await this.externalApiService.voteHandler(body);

        if (response.error) {
            res.status(HttpStatus.BAD_REQUEST).json(response);
            return;
        }

        res.send(response.success);
    }

    //event_user
    @SetMetadata('role', 'bot')
    @UseGuards(LoginGuardBearer, RoleGuard)
    @Post('/event_user')
    async eventUser(@Request() req, @Response() res, @Body() body: eventUserDto): Promise<any> {
        const response = await this.externalApiService.eventUser(body);

        if (response.error) {
            res.status(HttpStatus.BAD_REQUEST).json(response);
            return;
        }

        res.send(response.success);
    }
}

