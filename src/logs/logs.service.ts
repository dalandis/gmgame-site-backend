import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Logs } from './logs.model';

@Injectable()
export class LogsService {
    constructor(
        @InjectModel(Logs)
        private logsModel: typeof Logs,
    ) {}

    public async logger(log: string, type: string, user_id: string, manager: string, managerId: string, logDate?: Date) {
        this.logsModel.create({
            log,
            type,
            user_id,
            manager,
            managerId,
            log_date: logDate || new Date(),
        });
    }

    public async getLogs(id): Promise<Logs[]> {
        return await this.logsModel.findAll({
            where: {
                user_id: id,
            },
            order: [
                ['log_date', 'ASC'],
            ],
        });
    }
}