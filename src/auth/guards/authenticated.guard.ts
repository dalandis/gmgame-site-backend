import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AuthenticatedGuard extends AuthGuard('discord') {
    // async canActivate(context: ExecutionContext) {
    //     const request = context.switchToHttp().getRequest();
    //     console.log(request)
    //     if (request.user) {
    //         return false;
    //     }
    //     return request.isAuthenticated();
    // }
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();
        if (!request.user) {

            // res.redirect('http://193.124.206.25:3001/api/login');
            res.redirect('/api/login');
        }
        return request.isAuthenticated();
        // const activate = (await super.canActivate(context)) as boolean;
        // const request = context.switchToHttp().getRequest();
        // await super.logIn(request);
        // return activate;
    }
}

@Injectable()
export class BearerGuard extends AuthGuard('bearer') {
    // async canActivate(context: ExecutionContext) {
    //     const request = context.switchToHttp().getRequest();
    //     console.log(request)
    //     if (request.user) {
    //         return false;
    //     }
    //     return request.isAuthenticated();
    // }
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();
        if (!request.user) {

            // res.redirect('http://193.124.206.25:3001/api/login');
            res.redirect('/api/login');
        }
        return request.isAuthenticated();
        // const activate = (await super.canActivate(context)) as boolean;
        // const request = context.switchToHttp().getRequest();
        // await super.logIn(request);
        // return activate;
    }
}
