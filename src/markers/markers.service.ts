import { Injectable } from '@nestjs/common';
import { markersDto } from 'src/validator/save_edit.markers';
import { UtilsService, IWorldType } from '../Utils/utils.service';
import { Queue } from 'bull';
import { markers } from '@prisma/client';
import { InjectQueue } from '@nestjs/bull';
import { LogsService } from '../logs/logs.service';
import { PrismaService } from '../prisma/prisma.service';

interface IMarkerResponse {
  marker: markers;
  world: IWorldType;
}

@Injectable()
export class MarkersService {
  constructor(
    private readonly utilsService: UtilsService,
    @InjectQueue('markers')
    private markersQueue: Queue,
    private readonly logsService: LogsService,
    private readonly prismaService: PrismaService,
  ) {}

  async getMarkers(user_id: string): Promise<markers[]> {
    return this.prismaService.markers.findMany({
      where: {
        user_id,
      },
    });
  }

  async getMarker(user: string, id: number): Promise<IMarkerResponse> {
    if (!id) {
      return {
        marker: null,
        world: null,
      };
    }

    const marker = await this.prismaService.markers.findUnique({
      where: {
        id: id,
        user_id: user,
      },
    });

    return {
      marker: marker,
      world: this.utilsService.getWorldType(marker.id_type || ''),
    };
  }

  async editMarker(params: markersDto, user: string, manager): Promise<Record<string, string>> {
    try {
      const marker = await this.prismaService.markers.update({
        where: {
          id: params.markerID,
          user_id: user,
        },
        data: {
          server: params.server,
          id_type: params.id_type,
          name: params.name,
          x: params.x,
          y: 64,
          z: params.z,
          description: params.description,
        },
      });

      this.sendTask(marker.server, marker.id_type);

      this.logsService.logger(
        `маркер изменен => ${JSON.stringify(params)}`,
        'update-marker',
        user,
        manager.localuser?.username || manager.username,
        manager.id,
      );

      return { message: 'Маркер обновлен' };
    } catch (err) {
      return { error: `Ошибка при обновлении маркера: ${err}` };
    }
  }

  async addMarker(params: markersDto, user: string, manager): Promise<Record<string, string>> {
    try {
      const marker = await this.prismaService.markers.create({
        data: {
          server: params.server,
          id_type: params.id_type,
          name: params.name,
          x: params.x,
          y: 64,
          z: params.z,
          description: params.description,
          user_id: user,
          flag: 1,
        },
      });

      this.sendTask(marker.server, marker.id_type);

      this.logsService.logger(
        `Добавлен маркер ${JSON.stringify(marker)}`,
        'add-marker',
        user,
        manager.localuser?.username || manager.username,
        manager.id,
      );

      return { message: 'Маркер добавлен' };
    } catch (err) {
      return { error: `Ошибка при добавлении маркера: ${err}` };
    }
  }

  async deleteMarker(params: markersDto, user: string, manager): Promise<Record<string, string>> {
    try {
      const marker = await this.prismaService.markers.delete({
        where: {
          id: params.markerID,
          user_id: user,
        },
      });

      this.sendTask(marker.server, marker.id_type);

      this.logsService.logger(
        `Удален маркер ${JSON.stringify(marker)}`,
        'delete-marker',
        user,
        manager.localuser?.username || manager.username,
        manager.id,
      );

      return { message: 'Маркер удален' };
    } catch (err) {
      return { error: `Ошибка при удалении маркера: ${err}` };
    }
  }

  private async sendTask(serverName, type): Promise<void> {
    const job = await this.markersQueue.getJob(`refreshMarkers-${serverName}-${type}`);

    if (job && job.data.action === `refreshMarkers-${serverName}-${type}`) {
      return;
    }

    this.markersQueue.add(
      {
        action: `refreshMarkers-${serverName}-${type}`,
        serverName: serverName,
        type: type,
      },
      {
        jobId: `refreshMarkers-${serverName}-${type}`,
        removeOnComplete: true,
        delay: 1000 * 60 * 15,
      },
    );
  }
}
