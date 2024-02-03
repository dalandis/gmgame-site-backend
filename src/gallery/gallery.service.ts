import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Gallery } from './gallery.model';
import { UtilsService } from '../Utils/utils.service';
import { galleryDto } from 'src/validator/save_edit.gallery';
import { base64ToBlob } from 'base64-blob'


@Injectable()
export class GalleryService {
    constructor(
        @InjectModel(Gallery)
        private galleryModel: typeof Gallery,
        private readonly utilsService: UtilsService
    ) { }

    async getGalleries(user: string): Promise<Gallery[]> {
        return this.galleryModel.findAll({
            where: {
                user,
            }
        });
    }

    async getAllGalleries(): Promise<Gallery[]> {
        return this.galleryModel.findAll();
    }

    async getGallery(user: string, id: string): Promise<Gallery> {
        return this.galleryModel.findOne({
            where: {
                user,
                id
            }
        });
    }

    async editGallery(params: galleryDto, user: string): Promise<Record<string, string>> {
        try {
            const urlImagesData = await Promise.all(params.url.map(async item => await base64ToBlob(item)))
            await this.galleryModel.update(
                {
                    title: params.title,
                    description: params.description,
                    check: params.check,
                    url: urlImagesData,
                    authors: params?.authors ? params.authors : "",
                    tags: params?.tags ? params.tags : "",
                },
                {
                    where: {
                        id: params.galleryID,
                        user: user
                    }
                }
            );
            return { message: 'Пост в галерее обновлён' };
        } catch (err) {
            return { error: `Ошибка при обновлении: ${err}` };
        }
    }

    async addGallery(params: galleryDto, user: string): Promise<Record<string, string>> {
        try {
            const urlImagesData = await Promise.all(params.url.map(async item => await base64ToBlob(item)))
            await this.galleryModel.create({
                user: user,
                title: params.title,
                description: params.description,
                check: params.check,
                url: urlImagesData,
                authors: params?.authors ? params.authors : "",
                tags: params?.tags ? params.tags : "",
            });
            return { message: 'Пост для галереи создан' };
        } catch (err) {
            return { error: `Ошибка при создании: ${err}` };
        }
    }

    async deleteGallery(params: galleryDto, user: string): Promise<Record<string, string>> {
        try {
            await this.galleryModel.destroy({
                where: {
                    id: params.galleryID,
                    user: user
                }
            });

            return { message: 'Пост в галерее удалён' };
        } catch (err) {
            return { error: `Ошибка при удалении: ${err}` };
        }
    }
}
