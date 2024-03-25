import {
  Column,
  DataType,
  HasOne,
  Model,
  Table,
  HasMany,
} from 'sequelize-typescript';
import { User } from '../users/users.model';
import { GalleryImages } from './gallery-images.model';

@Table({ tableName: 'gallery' })
export class Gallery extends Model<Gallery> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number; //INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

  @Column({ type: DataType.STRING, allowNull: false })
  author: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: 'compositeIndex' })
  name: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  description: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  aprove: boolean;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  warning: boolean;

  @HasMany(() => UsersGallery, { sourceKey: 'id', foreignKey: 'gallery_id' })
  usersGallery: UsersGallery[];

  @HasOne(() => User, { sourceKey: 'author', foreignKey: 'user_id' })
  user: User;

  @HasMany(() => GalleryImages, { sourceKey: 'id', foreignKey: 'gallery_id' })
  galleryImages: GalleryImages[];
}

@Table({ tableName: 'users_gallery' })
export class UsersGallery extends Model<UsersGallery> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number; //INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

  @Column({ type: DataType.STRING, allowNull: false })
  user_id: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  gallery_id: number;

  @HasOne(() => User, { sourceKey: 'user_id', foreignKey: 'user_id' })
  user: User;
}
