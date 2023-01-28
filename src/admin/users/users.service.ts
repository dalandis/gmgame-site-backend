import { Injectable } from '@nestjs/common';
import { getUserDto } from '../../validator/admin/users-admin';
import { User } from '../../users/users.model';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

@Injectable()
export class UserAdminService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
    ) {}

    async getUser(params: getUserDto): Promise<User> {
        const user = await this.userModel.findOne({
            where: {
                [Op.or]: [
                    {user_id: params.searchParam},
                    {username: params.searchParam}
                ]
            },
            attributes: ['username', 'status', 'tag', 'type', 'user_id', 'age']
        });

        return user;
    }
}
