import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-http-bearer';
import { ConfigModule } from '@nestjs/config';

ConfigModule.forRoot({
  envFilePath: '.env.bearer',
});

const config = {
  tokenSuperhub: process.env.SUPERHUB_BEARER,
  tokenGmgame: process.env.GMGAME_BEARER,
  tokenBaxy: process.env.BAXY_BEARER,
  scope: ['all'],
};

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super(config);
  }

  async validate(token, done) {
    if (config.tokenSuperhub === token) {
      return done(null, { username: 'superhub', role: 'superhub' }, { scope: 'all' });
    }

    if (config.tokenGmgame === token) {
      return done(null, { username: 'gmgame', role: 'bot' }, { scope: 'all' });
    }

    if (config.tokenBaxy === token) {
      return done(null, { username: 'baxy', role: 'stremers' }, { scope: 'all' });
    }

    return done(null, false);
  }
}
