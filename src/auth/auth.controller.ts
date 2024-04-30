import { Controller, Get, UseGuards, Request, Response, Next, Post } from '@nestjs/common';
import { LoginGuard } from './guards/login.guard';

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
      let returnTo = new URL(req.session.returnTo).pathname || '/cab/profile';
      console.log('wjkfbwkfjwebjkfwbfbjkwefbwef', returnTo);
      returnTo = returnTo === '/' ? '/cab/profile' : returnTo;
      delete req.session.returnTo;
      res.redirect(returnTo);
    } else {
      res.status(500);
    }
  }

  @Post('/logout')
  logout(@Request() req, @Response() res, @Next() next) {
    req.logout();

    req.session.destroy();
    return res.send({ authenticated: req.isAuthenticated() });
  }
}
