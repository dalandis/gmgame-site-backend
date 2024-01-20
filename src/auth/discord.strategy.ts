import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Profile, Strategy } from 'passport-discord';
import { ConfigModule } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/users.model';

interface IProfile extends Profile {
  localuser?: User;
  role: string;
}

ConfigModule.forRoot({
  envFilePath: '.env.discord',
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
    private userModel: typeof User,
  ) {
    super(config);
  }

  async validate(accessToken: string, refreshToken: string, profile: IProfile) {
    if (profile) {
      const user = await this.userModel.findOne({
        where: {
          user_id: profile.id,
        },
        attributes: ['username', 'type', 'status'],
      });

      profile.role = this.getRole(profile.id, user?.status);

      if (user) {
        profile.localuser = user;
      }

      return profile;
    }
  }

  private getRole(id: string, status: number): string {
    if (
      [
        '274466897070915584',
        '502182630238978069',
        '665215934545395742',
        '502404476410527745',
      ].includes(id)
    ) {
      return 'admin';
    }

    if (status && status === 2) {
      return 'player';
    }

    return 'user';
  }
}
