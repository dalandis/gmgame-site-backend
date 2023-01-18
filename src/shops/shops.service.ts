import { Injectable } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {UsersService} from '../users/users.service';
import { User } from '../users/users.model';
import { Awards } from '../awards/awards.model';
import { InjectModel } from '@nestjs/sequelize';
import { UtilsService } from '../Utils/utils.service';
import { DataProviderService } from '../data-provider/data-provider.service';
import * as crypto from 'crypto';

ConfigModule.forRoot({
    envFilePath: '.env.api'
});

interface ISignData{
    project?: string,
    timestamp: string,
    username: string,
    signature: string
}

@Injectable()
export class ShopsService {
    constructor(
        private readonly dataProviderService: DataProviderService
    ) {}

    async getShops(): Promise<any> {
        try{
            const response = await this.dataProviderService.sendToServerApi({}, 'get_shops_new', 'POST');

            return response.data;
        } catch (err) {
            return { "error": "unknown error", "status_code": 400, "status": null };
        }
    }
}
