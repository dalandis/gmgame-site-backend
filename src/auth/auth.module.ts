import {Module} from '@nestjs/common';
import {PassportModule} from '@nestjs/passport';
import {DiscordStrategy} from './discord.strategy';
import {SessionSerializer} from './session.serializer';
import {BearerStrategy} from './bearer.strategy';
import {RoleGuard} from './roles/api-roles'
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../users/users.model';

@Module({
    imports: [
        PassportModule.register({defaultStrategy: 'discord', session: true}),
        SequelizeModule.forFeature([User])
    ],
    providers: [DiscordStrategy, SessionSerializer, BearerStrategy, RoleGuard]
})

export class AuthModule {}
