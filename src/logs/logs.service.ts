import { Injectable } from '@nestjs/common';
import { logs } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LogsService {
  constructor(private prismaService: PrismaService) {}

  public async logger(
    log: string,
    type: string,
    user_id: string,
    manager: string,
    managerId: string,
    logDate?: Date,
  ) {
    await this.prismaService.logs.create({
      data: {
        log,
        type,
        user_id,
        manager,
        managerId,
        log_date: logDate || new Date(),
      },
    });
  }

  public async getLogs(id): Promise<logs[]> {
    return await this.prismaService.logs.findMany({
      where: {
        user_id: id,
      },
      orderBy: {
        log_date: 'asc',
      },
    });
  }
}
