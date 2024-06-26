import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { DataProviderService } from '../data-provider/data-provider.service';

interface IJobCitizenship {
  action: string;
  citizenships: { username: string }[];
}

@Processor('citizenship')
export class CitizenshipConsumer {
  constructor(private readonly dataProviderService: DataProviderService) {}

  @Process()
  async citizenshipRefresh(job: Job<IJobCitizenship>) {
    const response = await this.dataProviderService.sendToBot(
      job.data,
      'citizenship_update',
      'POST',
    );

    if (response.status != 200) {
      throw new Error(`Ошибка при обновлении гражданства, error: ${response}`);
    }

    await job.progress(100);

    return {};
  }
}
