import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { saveGoalsDto } from '../validator/goals';
import { Op } from 'sequelize';
import * as Minio from 'minio';
import { ConfigModule } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

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
  constructor() {}

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
}
