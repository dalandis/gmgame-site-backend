import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectModel } from '@nestjs/sequelize';
import { Markers } from '../markers/markers.model';
import { DataProviderService } from '../data-provider/data-provider.service';

interface IJobMarkers{
    action: string;
    serverName: string;
    type: string;
}

@Processor('users')
export class UsersConsumer {
    constructor(
        @InjectModel(Markers)
        private markersModel: typeof Markers,
        private readonly dataProviderService: DataProviderService,
    ) {}

    @Process()
    async userDelete(job: Job<IJobMarkers>) {
        const markers = await this.markersModel.findAll({
            where: {
                server: job.data.serverName
            }
        });

        const payload = {
            markers: markers,
            server: job.data.serverName,
            type: job.data.type
        }

        const response = await this.dataProviderService.sendToServerApi(payload, 'refresh_markers_new', 'POST');

        if (response.status != 200) {
            throw new Error('Error while refreshing markers');
        }

        await job.progress(100);
        
        return {};
    }
}