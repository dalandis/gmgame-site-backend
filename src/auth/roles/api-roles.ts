import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const role = this.reflector.get<string>('role', context.getHandler());

    const request = context.switchToHttp().getRequest();

    if (request.user.role === 'admin') {
      return true;
    }

    return request.user.role === role;
    // return role.includes(request.user.role);
  }
}
