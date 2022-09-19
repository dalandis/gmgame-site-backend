import {PassportStrategy} from '@nestjs/passport';
import {Injectable} from '@nestjs/common';
import { Profile, Strategy } from 'passport-discord';
import { ConfigModule } from '@nestjs/config';

ConfigModule.forRoot({
    envFilePath: '.env.discord'
});

const config = {
    clientID: process.env.AUTH_CLIENT_ID,
    clientSecret: process.env.AUTH_CLIENT_SECRET,
    callbackURL: process.env.AUTH_CALLBACK,
    scope: ['identify', 'email'],
};

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy) {
    constructor() {
      super(config);
    }
  
    async validate(accessToken: string, refreshToken: string, profile: Profile) {
        if (profile) {
            return profile;
        }
    }
}
