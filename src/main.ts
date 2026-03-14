import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as passport from 'passport';
import { ValidationPipe } from '@nestjs/common';
import { json, NextFunction, Request, Response } from 'express';
import { AdminQueuesService } from './admin/queues/queues.service';
const cookieSession = require('cookie-session');
// const connectRedis = require('connect-redis');
const redis = require('redis');
const session = require('express-session');
import RedisStore from 'connect-redis';

function ensureAdminBullBoardAccess(req: Request, res: Response, next: NextFunction) {
  const isAuthenticated = typeof req.isAuthenticated === 'function' && req.isAuthenticated();
  const user = req.user as { role?: string } | undefined;

  if (isAuthenticated && user?.role === 'admin') {
    next();
    return;
  }

  res.status(403).send('Forbidden');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.enableCors({
    origin: ['https://map.gmgame.ru', 'https://gmgame.ru', 'https://new.gmgame.ru'],
    credentials: true,
  });

  // app.use(cookieSession({
  //     name: 'session',
  //     keys: [process.env.SECRET_SESSION],
  //     maxAge: 24 * 60 * 60 * 1000 // 24 часа
  // }))
  // session to redis
  // const RedisStore = connectRedis(session)

  // const RedisStore = createRedisStore(session);
  // Initialize client.
  const redisClient = redis.createClient();
  redisClient.connect().catch(console.error);

  // Initialize store.
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'gmgame:',
    ttl: 31536000,
  });

  app.use(
    session({
      store: redisStore,
      resave: false,
      saveUninitialized: false,
      secret: process.env.SECRET_SESSION,
      cookie: {
        secure: false,
        httpOnly: false,
        maxAge: 1000 * 60 * 60 * 24 * 365,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(json({ limit: '50mb' }));

  if (process.env.ENABLE_BULL_BOARD_DEBUG_UI === 'true') {
    const adminQueuesService = app.get(AdminQueuesService);
    app.use(
      adminQueuesService.getDebugBullBoardPath(),
      ensureAdminBullBoardAccess,
      adminQueuesService.getDebugBullBoardRouter(),
    );
  }

  await app.listen(3001);
}
bootstrap();
