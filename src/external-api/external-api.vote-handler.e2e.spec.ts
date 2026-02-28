import { Test, TestingModule } from '@nestjs/testing';
import * as crypto from 'crypto';
import { getQueueToken } from '@nestjs/bull';
import { ExternalApiController } from './external-api.controller';
import { ExternalApiService } from './external-api.service';
import { VoteValidationService } from './vote-validation.service';
import { UsersService } from '../users/users.service';
import { UtilsService } from '../Utils/utils.service';
import { DataProviderService } from '../data-provider/data-provider.service';
import { LogsService } from '../logs/logs.service';
import { PrismaService } from '../prisma/prisma.service';
import { NestjsFormDataModule } from 'nestjs-form-data';

describe('ExternalApiController vote_handler (e2e)', () => {
  let moduleRef: TestingModule;
  let controller: ExternalApiController;

  const dataProviderMock = {
    sendToBot: jest.fn(),
  };

  const prismaMock = {
    users: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    awards: {
      create: jest.fn(),
    },
  };

  const makeRes = () => ({
    status: jest.fn().mockReturnThis(),
    type: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  });

  beforeEach(async () => {
    process.env.SECRET_KEY_FOR_VOTE_MINESERV = 'mineserv-token';
    process.env.SECRET_KEY_FOR_VOTE_HOTMC = 'hotmc-token';
    process.env.SECRET_KEY_FOR_VOTE_MCLIKE = 'mclike-token';
    process.env.SECRET_KEY_FOR_VOTE_MINECRAFTRATING = 'rating-token';
    process.env.CHANCE_TOOLS = '0';
    process.env.CHANCE_MONEY = '0';

    dataProviderMock.sendToBot.mockReset();
    prismaMock.users.findFirst.mockReset();
    prismaMock.users.update.mockReset();
    prismaMock.awards.create.mockReset();

    prismaMock.users.findFirst.mockResolvedValue({ user_id: 'u-1', balance: 10 });
    prismaMock.users.update.mockResolvedValue({});
    prismaMock.awards.create.mockResolvedValue({});

    moduleRef = await Test.createTestingModule({
      imports: [NestjsFormDataModule],
      controllers: [ExternalApiController],
      providers: [
        ExternalApiService,
        VoteValidationService,
        {
          provide: UsersService,
          useValue: {},
        },
        {
          provide: UtilsService,
          useValue: {},
        },
        {
          provide: DataProviderService,
          useValue: dataProviderMock,
        },
        {
          provide: getQueueToken('users'),
          useValue: {},
        },
        {
          provide: LogsService,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    controller = moduleRef.get<ExternalApiController>(ExternalApiController);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('returns 200 ok for valid MineServ payload', async () => {
    const signature = crypto
      .createHash('sha256')
      .update('gmgame.mineserv-token.1700000000.Steve')
      .digest('hex');

    const res = makeRes();

    await controller.voteHandler({} as any, res as any, {
      project: 'gmgame',
      username: 'Steve',
      timestamp: '1700000000',
      signature,
    });

    expect(res.type).toHaveBeenCalledWith('text/plain');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('ok');
  });

  it('returns 200 ok for valid HotMC payload', async () => {
    const sign = crypto
      .createHash('sha1')
      .update('Alex1700000010hotmc-token')
      .digest('hex');

    const res = makeRes();

    await controller.voteHandler({} as any, res as any, { nick: 'Alex', time: '1700000010', sign });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('ok');
  });

  it('returns 200 ok for legacy username/timestamp/signature payload', async () => {
    const signature = crypto
      .createHash('sha1')
      .update('Alex1700000010hotmc-token')
      .digest('hex');

    const res = makeRes();

    await controller.voteHandler(
      {} as any,
      res as any,
      { username: 'Alex', timestamp: '1700000010', signature },
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('ok');
  });

  it('returns 200 ok for valid MCLike payload', async () => {
    const sign = crypto
      .createHash('sha1')
      .update('Alex1700000011mclike-token')
      .digest('hex');

    const res = makeRes();

    await controller.voteHandler({} as any, res as any, { nick: 'Alex', time: '1700000011', sign });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('ok');
  });

  it('returns 200 ok for valid MinecraftRating payload', async () => {
    const signature = crypto
      .createHash('sha1')
      .update('Steve1700000012rating-token')
      .digest('hex');

    const res = makeRes();

    await controller.voteHandler({} as any, res as any, {
      username: 'Steve',
      ip: '127.0.0.1',
      timestamp: '1700000012',
      signature,
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('ok');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = makeRes();

    await controller.voteHandler({} as any, res as any, { nick: 'Alex' });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Required data not transmitted.');
  });

  it('returns 400 when signature is invalid', async () => {
    const res = makeRes();

    await controller.voteHandler({} as any, res as any, {
      nick: 'Alex',
      time: '1700000010',
      sign: 'deadbeef',
    });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Transmitted data did not pass validation.');
  });

  it('returns 400 for unknown payload format', async () => {
    const res = makeRes();

    await controller.voteHandler({} as any, res as any, { hello: 'world' });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Required data not transmitted.');
  });

  it('calls existing reward logic for valid requests', async () => {
    const sign = crypto
      .createHash('sha1')
      .update('Alex1700000010hotmc-token')
      .digest('hex');

    const res = makeRes();

    await controller.voteHandler({} as any, res as any, { nick: 'Alex', time: '1700000010', sign });

    expect(dataProviderMock.sendToBot).toHaveBeenCalledWith(
      {
        username: 'Alex',
        prize: '',
      },
      'send_embed',
      'POST',
    );
    expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
      where: {
        username: 'Alex',
      },
      select: {
        user_id: true,
        balance: true,
      },
    });
    expect(prismaMock.users.update).toHaveBeenCalledWith({
      where: {
        username: 'Alex',
      },
      data: {
        balance: 15,
      },
    });
  });
});
