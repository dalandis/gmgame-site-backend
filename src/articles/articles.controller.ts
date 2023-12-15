import { Controller, Get, UseGuards, Request, Response, Post, Body, SetMetadata } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
// import { rewardsDto } from '../validator/give.rewards';
import { RoleGuard } from '../auth/roles/api-roles';

@Controller('/api')
export class ArticlesController {
    constructor(
        private readonly articlesService: ArticlesService
    ) {}

    @SetMetadata('role', 'player')
    @UseGuards(AuthenticatedGuard, RoleGuard)
    @Get('/get_articles')
    async getArticles(@Request() req, @Response() res): Promise<any> {
        const articles = await this.articlesService.getArticles(req.user.id);

        res.send({
            count: articles.length,
            articles: articles
        });
    }

    @SetMetadata('role', 'player')
    @UseGuards(AuthenticatedGuard, RoleGuard)
    @Get('/get_article/:id')
    async getArticle(@Request() req, @Response() res): Promise<any> {
        const article = await this.articlesService.getArticle(req.params.id);

        res.send(article);
    }
    
}