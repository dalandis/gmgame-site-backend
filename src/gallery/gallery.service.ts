import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, where } from 'sequelize';
import * as Minio from 'minio';
import { ConfigModule } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { Gallery } from './gallery.model';
import { galleryDto } from '../validator/gallery';
import { User } from '../users/users.model';
import { GalleryImages } from './gallery-images.model';

ConfigModule.forRoot({
  envFilePath: '.env.minio',
});

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_END_POINT,
  port: parseInt(process.env.MINIO_PORT),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

@Injectable()
export class GalleryService {
  constructor(
    @InjectModel(Gallery)
    private galleryModel: typeof Gallery,
    @InjectModel(GalleryImages)
    private galleryImagesModel: typeof GalleryImages,
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async saveImages(files: Array<Express.Multer.File>): Promise<any> {
    const fileNames = [];

    for (const file of files) {
      const metaData = {
        'Content-Type': file.mimetype,
      };

      const uuid = uuidv4();

      await minioClient
        .putObject(
          'static',
          `${file.originalname}-${uuid}`,
          file.buffer,
          metaData,
        )
        .then((res) => {
          fileNames.push(
            `http://msk.gmgame.ru:9000/static/${file.originalname}-${uuid}`,
          );
        })
        .catch((err) => {
          console.log(err);
        });
    }

    return fileNames;
  }

  async getGalleries(): Promise<any> {
    return this.galleryModel.findAll({
      where: {
        warning: false,
        aprove: true,
      },
      include: [
        {
          model: GalleryImages,
          attributes: ['image'],
        },
        {
          model: User,
          attributes: ['username'],
        },
      ],
    });
  }

  async createGallery(body: galleryDto, user: User): Promise<any> {
    const existGallery = await this.galleryModel.findOne({
      where: {
        name: body.name,
      },
    });

    if (existGallery) {
      return { error: 'gallery exist' };
    }

    const gallery = await this.galleryModel.create({
      name: body.name,
      description: body.description,
      author: user.user_id,
    });

    const galleryImages = [];

    for (const image of body.links) {
      galleryImages.push({
        gallery_id: gallery.id,
        image: image,
      });
    }

    await this.galleryImagesModel.bulkCreate(galleryImages);

    return { message: 'gallery created' };
  }

  async getGallery(id: number, user: User): Promise<any> {
    const gallery = await this.galleryModel.findOne({
      where: {
        id,
      },
      include: [
        {
          model: GalleryImages,
          attributes: ['image'],
        },
        {
          model: User,
          attributes: ['username'],
        },
      ],
    });

    if (gallery.author !== user?.user_id && !gallery.aprove) {
      return { error: 'not your gallery' };
    }

    return gallery;
  }

  async editGallery(body: galleryDto, user: User): Promise<any> {
    const gallery = await this.galleryModel.findOne({
      where: {
        id: body.id,
      },
    });

    if (gallery.author !== user.username) {
      return { error: 'not your gallery' };
    }

    await this.galleryModel.update(
      {
        name: body.name,
        description: body.description,
        aprove: false,
        warning: false,
      },
      {
        where: {
          id: body.id,
        },
      },
    );

    await this.galleryImagesModel.destroy({
      where: {
        gallery_id: body.id,
      },
    });

    const galleryImages = [];

    for (const image of body.links) {
      galleryImages.push({
        gallery_id: body.id,
        image: image,
      });
    }

    await this.galleryImagesModel.bulkCreate(galleryImages);

    return { message: 'gallery updated' };
  }

  async deleteGallery(id: number, user: User): Promise<any> {
    const gallery = await this.galleryModel.findOne({
      where: {
        id,
      },
    });

    if (gallery.author !== user.username) {
      return { error: 'not your gallery' };
    }

    await this.galleryModel.destroy({
      where: {
        id,
      },
    });

    await this.galleryImagesModel.destroy({
      where: {
        gallery_id: id,
      },
    });

    return { message: 'gallery deleted' };
  }

  async approveGallery(id: number): Promise<any> {
    const gallery = await this.galleryModel.findOne({
      where: {
        id,
      },
    });

    await this.galleryModel.update(
      {
        aprove: true,
      },
      {
        where: {
          id,
        },
      },
    );

    return { message: 'gallery approved' };
  }

  async rejectGallery(id: number): Promise<any> {
    const gallery = await this.galleryModel.findOne({
      where: {
        id,
      },
    });

    await this.galleryModel.update(
      {
        warning: true,
      },
      {
        where: {
          id,
        },
      },
    );

    return { message: 'gallery rejected' };
  }
}
