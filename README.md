<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Описание 

Бэкенд сайта gmgame

## Установка

```bash
$ npm i
```

Установить mysql

Создать базу и пользователя
```bash
create database dbname character set utf8;
create user 'dbuser'@'localhost' identified by 'userpassword';
grant all privileges on dbname.* to 'dbuser'@'localhost';
```

## Конфигурация

.env
```bash
MYSQL_HOST=localhost
MYSQL_DB_NAME=gmgame_test
MYSQL_DB_USER=gmgame_test
MYSQL_DB_PASSWORD=111111111
```

.env.discord
```bash
SECRET_SESSION='kljb;wknf;lkmdlcmwiofhwuihrpfhfonds;lkcsdmsdljds'
AUTH_CLIENT_ID=1234567891
AUTH_CLIENT_SECRET='jbfkwbfwhlfwbj;kfnweklfnwfklwfkwjfe'
AUTH_CALLBACK='http://127.0.0.1:3001/api/callback'
URL_WEBHOOK_FOR_REG='https://discord.com/api/webhooks/7823698724748274624/jblkjebkgjnrg;ernjkerlvblerjhvjejkrververvr'
```

## Запуск приложения

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Миграции

```bash
npx sequelize-cli migration:create --name NAME
npx sequelize-cli db:migrate --url 'mysql://dbname:dbuser@127.0.0.1/password'
```

## License

Nest is [MIT licensed](LICENSE).
# gmgame-site-backend
