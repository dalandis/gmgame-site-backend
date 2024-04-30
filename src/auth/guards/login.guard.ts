import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LoginGuard extends AuthGuard('discord') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (!request.session.returnTo) {
      request.session.returnTo = request.headers.referer;
    }

    const result = (await super.canActivate(context)) as boolean;
    // const req = context.switchToHttp().getRequest();
    // request.session.returnTo = req.headers.returnTo;
    await super.logIn(request);
    return result;
  }
}

@Injectable()
export class LoginGuardBearer extends AuthGuard('bearer') {
  async canActivate(context: ExecutionContext) {
    const result = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    return result;
  }
}
