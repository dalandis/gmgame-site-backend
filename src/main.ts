import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as passport from 'passport';
import { ValidationPipe } from '@nestjs/common';
var cookieSession = require('cookie-session')

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(cookieSession({
        name: 'session',
        keys: [process.env.SECRET_SESSION],
        maxAge: 24 * 60 * 60 * 1000 // 24 часа
    }))

    app.use(passport.initialize());
    app.use(passport.session());

    app.useGlobalPipes(new ValidationPipe());
    
    await app.listen(3001);
}
bootstrap();
