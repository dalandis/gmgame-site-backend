import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Profile, Strategy } from 'passport-discord';
import { PrismaService } from '../prisma/prisma.service';

interface IProfile extends Profile {
  localuser?: {
    username: string;
    type: number;
    status: number;
  };
  role: string;
}

const config = {
  clientID: process.env.AUTH_CLIENT_ID,
  clientSecret: process.env.AUTH_CLIENT_SECRET,
  callbackURL: 'https://new.gmgame.ru/api/callback',
  scope: ['identify', 'email'],
  keepSessionInfo: true,
};

@Injectable()
export class DiscordNewStrategy extends PassportStrategy(Strategy, 'discord-new') {
  constructor(private readonly prismaService: PrismaService) {
    super(config);
  }

  async validate(accessToken: string, refreshToken: string, profile: IProfile) {
    if (profile) {
      const user = await this.prismaService.users.findUnique({
        where: { user_id: profile.id },
        select: { username: true, type: true, status: true },
      });

      profile.role = this.getRole(profile.id, user?.status);
      if (user) profile.localuser = user;
      return profile;
    }
  }

  private getRole(id: string, status: number): string {
    if (JSON.parse(process.env.ADMINS_IDS).includes(id)) return 'admin';
    if (status && status === 2) return 'player';
    return 'user';
  }
}
