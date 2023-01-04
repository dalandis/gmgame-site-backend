import {PassportStrategy} from '@nestjs/passport';
import {Injectable} from '@nestjs/common';
import { Profile, Strategy } from 'passport-discord';
import { ConfigModule } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/users.model';

interface IProfile extends Profile {
    localuser?: User
}

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
    constructor(
        @InjectModel(User)
        private userModel: typeof User
    ) {
      super(config);
    }
  
    async validate(accessToken: string, refreshToken: string, profile: IProfile) {
        if (profile) {
            const user = await this.userModel.findOne({
                where: {
                    user_id: profile.id
                },
                attributes: ['username', 'type']
            });

            if (user) {
                profile.localuser = user;
            }

            return profile;
        }
    }
}
