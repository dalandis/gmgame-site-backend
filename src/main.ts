import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as passport from 'passport';
import { ValidationPipe } from '@nestjs/common';
const cookieSession = require('cookie-session');
const Queue = require('bull');
const { createBullBoard } = require('bull-board');
const { BullAdapter } = require('bull-board/bullAdapter');
import * as basicAuth from 'express-basic-auth';
// const connectRedis = require('connect-redis');
const redis = require('redis');
const session = require('express-session');
import RedisStore from 'connect-redis';
import { json } from 'express';

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

  app.useGlobalPipes(new ValidationPipe());

  const { router, setQueues, replaceQueues, addQueue, removeQueue } = createBullBoard([
    new BullAdapter(new Queue('users')),
    new BullAdapter(new Queue('cron-tasks')),
    new BullAdapter(new Queue('markers')),
    new BullAdapter(new Queue('citizenship')),
  ]);

  const protect = basicAuth({
    users: { [process.env.BASIC_AUTH_USERNAME]: process.env.BASIC_AUTH_PASSWORD },
    challenge: true,
  });

  app.use(json({ limit: '50mb' }));

  app.use('/admin/queues', protect, router);

  await app.listen(3001);
}
bootstrap();
