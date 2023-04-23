import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as passport from 'passport';
import { ValidationPipe } from '@nestjs/common';
const cookieSession = require('cookie-session')
const Queue = require('bull')
const { createBullBoard } = require('bull-board')
const { BullAdapter } = require('bull-board/bullAdapter')
import * as basicAuth from 'express-basic-auth';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: 'https://map.gmgame.ru',
        credentials: true
    });

    app.use(cookieSession({
        name: 'session',
        keys: [process.env.SECRET_SESSION],
        maxAge: 24 * 60 * 60 * 1000 // 24 часа
    }))

    app.use(passport.initialize());
    app.use(passport.session());

    app.useGlobalPipes(new ValidationPipe());

    const { router, setQueues, replaceQueues, addQueue, removeQueue } = createBullBoard([
        new BullAdapter(new Queue('users')),
        new BullAdapter(new Queue('cron-tasks')),
      ])
    
    const protect = basicAuth({
        users: { [process.env.BASIC_AUTH_USERNAME]: process.env.BASIC_AUTH_PASSWORD },
        challenge: true
    })
    
    app.use('/admin/queues', protect, router);
    
    await app.listen(3001);
}
bootstrap();
