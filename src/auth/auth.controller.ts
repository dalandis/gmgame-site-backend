import { Controller, Get, UseGuards, Request, Response, Next, Post } from '@nestjs/common';
import { LoginGuard } from './guards/login.guard';
import { LoginNewGuard } from './guards/login-new.guard';

const DEFAULT_REDIRECT = 'https://gmgame.ru/cab/profile';

@Controller('/api')
export class AuthController {
  constructor() {}

  @UseGuards(LoginGuard)
  @Get('/login')
  login(): void {}

  @UseGuards(LoginGuard)
  @Get('/callback')
  discordAuthCallback(@Request() req, @Response() res) {
    if (req.user) {
      const stored = req.session.returnTo;
      delete req.session.returnTo;

      let redirect = DEFAULT_REDIRECT;
      if (stored) {
        try {
          const url = new URL(stored);
          if (url.origin === 'https://gmgame.ru') {
            redirect = stored;
          }
        } catch {}
      }

      return res.redirect(redirect);
    } else {
      return res.status(500).send('Authentication failed');
    }
  }

  @UseGuards(LoginNewGuard)
  @Get('/login-new')
  loginNew(): void {}

  @UseGuards(LoginNewGuard)
  @Get('/callback-new')
  discordNewAuthCallback(@Request() req, @Response() res) {
    if (req.user) {
      return res.redirect('https://new.gmgame.ru/cab/profile');
    } else {
      return res.status(500).send('Authentication failed');
    }
  }

  @Post('/logout')
  logout(@Request() req, @Response() res, @Next() next) {
    req.session.passport = null;
    req.session.destroy();
    return res.send({ authenticated: req.isAuthenticated() });
  }
}
