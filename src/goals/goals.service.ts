import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { saveGoalsDto } from '../validator/goals';
import { Goals } from './goals.model';
import { Op } from 'sequelize';

@Injectable()
export class GoalsService {
    constructor(
        @InjectModel(Goals)
        private goalsModel: typeof Goals,
    ) {}

    async getGoals(): Promise<any> {
        const date = new Date();
        
        const goals = await this.goalsModel.findAll({
            where: {
                [Op.and]: [
                    {endTime: {[Op.gt]: date}},
                    {archived: 0}
                ]
            }
        });

        return goals;
    }

    async saveGoal (data: saveGoalsDto): Promise<any> {
        const goal = await this.goalsModel.findOne({ where: { id: data.id } });

        if (goal) {
            await this.goalsModel.update(data, { where: { id: data.id } });
        } else {
            delete data.id;
            await this.goalsModel.create(data);
        }

        return {message: 'Сохранено'};
    }
}