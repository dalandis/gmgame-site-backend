import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {

    public async getWorldName(world: string): Promise<string> {
        switch(world) {
            case 'gmgame':
                return 'GMGameWorld - overworld';
            case 'farm':
                return 'FarmWorld - overworld';
            default:
                return 'GMGameWorld - overworld';
        }
    }


    public async getStatus(status: number): Promise<string> {
        switch(status) {
            case 1:
                return 'Заявка на рассмотрении';
            case 2:
                return 'Игрок сервера';
            case 3:
                return 'Отказ по заявке';
            case 4:
                return 'Бан на сервере';
            case 5:
                return 'Не активный игрок';
            default:
                return 'Новая заявка';
        }
    }
}