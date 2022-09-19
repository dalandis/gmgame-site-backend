import {Module} from '@nestjs/common';
import {PassportModule} from '@nestjs/passport';
import {DiscordStrategy} from './discord.strategy';
import {SessionSerializer} from './session.serializer';

@Module({
    imports: [
        PassportModule.register({defaultStrategy: 'discord', session: true}),
    ],
    providers: [DiscordStrategy, SessionSerializer]
})

export class AuthModule {}
