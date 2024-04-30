import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { DataProviderService } from '../data-provider/data-provider.service';
import { PrismaService } from '../prisma/prisma.service';

interface IJobMarkers {
  action: string;
  serverName: string;
  type: string;
}

@Processor('markers')
export class MarkersConsumer {
  constructor(
    private readonly dataProviderService: DataProviderService,
    private readonly prismaService: PrismaService,
  ) {}

  @Process()
  async markersRefresh(job: Job<IJobMarkers>) {
    const markers = await this.prismaService.markers.findMany({
      where: {
        server: job.data.serverName,
        id_type: job.data.type,
      },
    });

    const payload = {
      markers: markers,
      server: job.data.serverName,
      type: job.data.type,
    };

    const response = await this.dataProviderService.sendToServerApi(
      payload,
      'refresh_markers_new',
      'POST',
    );

    if (response.status != 200) {
      throw new Error('Error while refreshing markers');
    }

    await job.progress(100);

    return {};
  }
}
