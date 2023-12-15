import {Module} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../users/users.model';
import { ArticlesController } from './articles.controller';
import { Articles } from './articles.model';
import { ArticlesService } from './articles.service';
import { DataProviderService } from '../data-provider/data-provider.service';

@Module({
    imports: [
        SequelizeModule.forFeature([Articles, User])
    ],
    controllers: [ArticlesController],
    providers: [ArticlesService, DataProviderService],
})

export class ArticlesModule {}