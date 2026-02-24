import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AuthenticatedGuard extends AuthGuard('discord') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    if (!request.isAuthenticated()) {
      const accept = (request.headers['accept'] as string) ?? '';
      if (accept.includes('application/json')) {
        res.status(401).json({ message: 'Unauthorized' });
      } else {
        res.redirect('/api/login');
      }
      return false;
    }
    return true;
  }
}

@Injectable()
export class BearerGuard extends AuthGuard('bearer') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    if (!request.isAuthenticated()) {
      res.redirect('/api/login');
      return false;
    }
    return true;
  }
}
