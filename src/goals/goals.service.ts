import { Injectable } from '@nestjs/common';
import { saveGoalsDto } from '../validator/goals';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GoalsService {
  constructor(private prismaService: PrismaService) {}

  async getGoals(): Promise<any> {
    const date = new Date();

    const goals = await this.prismaService.goals.findMany({
      where: {
        endTime: {
          gt: date,
        },
        archived: false,
      },
    });

    return goals;
  }

  async saveGoal(data: saveGoalsDto): Promise<any> {
    const goal = await this.prismaService.goals.findUnique({
      where: {
        id: data.id,
      },
    });

    if (goal) {
      await this.prismaService.goals.update({
        where: {
          id: data.id,
        },
        data,
      });
    } else {
      delete data.id;
      await this.prismaService.goals.create({
        data,
      });
    }

    return { message: 'Сохранено' };
  }
}
