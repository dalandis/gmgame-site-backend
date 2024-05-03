import { Injectable } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { DataProviderService } from '../data-provider/data-provider.service';

ConfigModule.forRoot({
  envFilePath: '.env.api',
});

interface ISignData {
  project?: string;
  timestamp: string;
  username: string;
  signature: string;
}

@Injectable()
export class ShopsService {
  private readonly redis: Redis;
  constructor(
    private readonly dataProviderService: DataProviderService,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getClient();
  }

  async getShops(): Promise<any> {
    try {
      let shops = await this.redis.get(`gmgame:shops`);

      if (shops) {
        return JSON.parse(shops);
      }

      const response = await this.dataProviderService.sendToServerApiNew({}, 'get_shops', 'GET');

      //15 minutes
      this.redis.set(`gmgame:shops`, JSON.stringify(response.data), 'EX', 900);

      return response.data;
    } catch (err) {
      return { error: 'unknown error', status_code: 400, status: null };
    }
  }
}
