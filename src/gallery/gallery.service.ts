import { Injectable } from '@nestjs/common';
import * as Minio from 'minio';
import { ConfigModule } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';
import { galleryDto } from '../validator/gallery';
import { PrismaService } from '../prisma/prisma.service';

ConfigModule.forRoot({
  envFilePath: '.env.minio',
});

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_END_POINT,
  port: parseInt(process.env.MINIO_PORT),
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

@Injectable()
export class GalleryService {
  constructor(private prismaService: PrismaService) {}

  async saveImages(files: Array<Express.Multer.File>): Promise<any> {
    const fileNames = [];
    const promises = [];

    let errorOccurred = false;

    for (const file of files) {
      const metaData = {
        'Content-Type': file.mimetype,
      };

      const resizeStreams = this.createResizeStreams(file.buffer, file.mimetype.split('/')[1]);

      const filename = `${uuidv4()}-${file.originalname}`;

      fileNames.push(`https://static.gmgame.ru/static/${filename}`);

      resizeStreams.map(async ({ stream, suffix }) => {
        promises.push(
          new Promise<void>(async (resolve, reject) => {
            const sizeStream = await stream.toBuffer().then((data) => data.length);

            try {
              await minioClient.putObject(
                'static',
                `${filename}${suffix}`,
                stream,
                sizeStream,
                metaData,
              );
              resolve();
            } catch (error) {
              console.error(`Ошибка при загрузке файла ${filename}${suffix}:`, error);
              errorOccurred = true;
              reject(error);
            }
          }),
        );
      });
    }

    await Promise.all(promises);

    if (errorOccurred) {
      return { success: false, data: [] };
    }

    return { success: true, data: fileNames };
  }

  private createResizeStreams(file: Buffer, format: any) {
    const minMipmap = 4;
    const maxMipmap = 8;
    const maxWidth = 2560;

    let imageStream = sharp(file);

    if (['jpeg', 'webp', 'avif'].indexOf(format)) {
      imageStream = imageStream.toFormat(format, {
        quality: 70,
        progressive: true,
      });
    } else {
      imageStream = imageStream.toFormat(format);
    }

    const result = [
      {
        stream: imageStream.clone().resize({ width: maxWidth, withoutEnlargement: true }),
        suffix: '',
      },
    ];

    for (let i = minMipmap; i <= maxMipmap; i *= 2) {
      const width = maxWidth / i;

      result.push({
        stream: imageStream.clone().resize({ width, withoutEnlargement: true }),
        suffix: `@${i}`,
      });
    }

    return result;
  }

  async getGalleries(): Promise<any> {
    return this.prismaService.gallery.findMany({
      where: {
        warning: false,
        aprove: true,
      },
      include: {
        galleryImages: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });
  }

  async createGallery(body: galleryDto, user): Promise<any> {
    const existGallery = await this.prismaService.gallery.findFirst({
      where: {
        name: body.name,
      },
    });

    if (existGallery) {
      return { error: 'Пост с таким названием уже существует' };
    }

    const gallery = await this.prismaService.gallery.create({
      data: {
        name: body.name,
        description: body.description,
        author: user.id,
      },
    });

    const galleryImages = [];

    for (const image of body.links) {
      galleryImages.push({
        gallery_id: gallery.id,
        image: image,
      });
    }

    await this.prismaService.galleryImages.createMany({
      data: galleryImages,
    });

    return { message: 'Пост создан' };
  }

  async getGallery(id: number, user): Promise<any> {
    const gallery = await this.prismaService.gallery.findFirst({
      where: {
        id,
      },
      include: {
        galleryImages: {
          select: {
            image: true,
          },
        },
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    if (gallery?.author !== user?.id && !gallery.aprove) {
      return { error: 'Это не твой пост' };
    }

    return gallery;
  }

  async editGallery(body: galleryDto, user): Promise<any> {
    const gallery = await this.prismaService.gallery.findFirst({
      where: {
        id: body.id,
      },
    });

    if (gallery.author !== user.id) {
      return { error: 'Это не твой пост' };
    }

    await this.prismaService.gallery.update({
      where: {
        id: body.id,
      },
      data: {
        name: body.name,
        description: body.description,
        aprove: false,
        warning: false,
      },
    });

    await this.prismaService.galleryImages.deleteMany({
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

    await this.prismaService.galleryImages.createMany({
      data: galleryImages,
    });

    return { message: 'Пост обновлен' };
  }

  async deleteGallery(id: number, user): Promise<any> {
    const gallery = await this.prismaService.gallery.findFirst({
      where: {
        id,
      },
    });

    if (gallery.author !== user.id) {
      return { error: 'Это не твой пост' };
    }

    await this.prismaService.galleryImages.deleteMany({
      where: {
        gallery_id: id,
      },
    });

    await this.prismaService.gallery.delete({
      where: {
        id,
      },
    });

    return { message: 'Пост удалён' };
  }

  async approveGallery(id: number): Promise<any> {
    await this.prismaService.gallery.update({
      where: {
        id,
      },
      data: {
        aprove: true,
      },
    });

    return { message: 'Пост опубликован' };
  }

  async rejectGallery(id: number): Promise<any> {
    await this.prismaService.gallery.update({
      where: {
        id,
      },
      data: {
        warning: true,
      },
    });

    return { message: 'Пост отключён' };
  }

  async getMyGalleries(user): Promise<any> {
    return this.prismaService.gallery.findMany({
      where: {
        author: user.id,
      },
      include: {
        galleryImages: {
          select: {
            image: true,
          },
        },
        user: {
          select: {
            username: true,
          },
        },
      },
    });
  }

  async getAllGalleries(): Promise<any> {
    return this.prismaService.gallery.findMany({
      include: {
        galleryImages: {
          select: {
            image: true,
          },
        },
        user: {
          select: {
            username: true,
          },
        },
      },
    });
  }
}
