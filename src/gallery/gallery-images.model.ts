import {
  Column,
  DataType,
  HasOne,
  Model,
  Table,
  HasMany,
} from 'sequelize-typescript';
import { User } from '../users/users.model';
import { Gallery } from './gallery.model';

@Table({ tableName: 'gallery_images' })
export class GalleryImages extends Model<GalleryImages> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number; //INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

  @Column({ type: DataType.INTEGER, allowNull: false })
  gallery_id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  image: string;

  @HasOne(() => Gallery, { sourceKey: 'gallery_id', foreignKey: 'id' })
  gallery: Gallery;
}
