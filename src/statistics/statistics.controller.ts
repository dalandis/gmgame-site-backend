import { Controller, Request, Response, HttpStatus, Get } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
@Controller('/api')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('/get_statistics')
  async getStatistics(@Request() req, @Response() res): Promise<any> {
    const response = await this.statisticsService.getStatistics();

    res.send(response);
  }
}
