import { Injectable } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UtilsService } from '../Utils/utils.service';
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
export class StatisticsService {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly dataProviderService: DataProviderService,
  ) {}

  async getStatistics(): Promise<any> {
    try {
      const response = await this.dataProviderService.sendToServerApi({}, 'get_stat_new', 'POST');

      return response.data;
    } catch (err) {
      return { error: 'unknown error', status_code: 400, status: null };
    }
  }
}
