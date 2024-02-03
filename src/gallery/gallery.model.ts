import { Column, DataType, HasOne, Model, Table } from "sequelize-typescript";
import { User } from '../users/users.model';

@Table({ tableName: 'gallery' })
export class Gallery extends Model<Gallery> {
    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number; //INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

    @Column({ type: DataType.STRING, allowNull: false })
    user: string;

    @Column({ type: DataType.STRING, allowNull: false })
    authors: string;

    @Column({ type: DataType.STRING, allowNull: false })
    tags: string;

    @Column({ type: DataType.STRING, allowNull: false })
    title: string;

    @Column({ type: DataType.STRING, allowNull: false })
    description: string;

    @Column({ type: DataType.ARRAY(DataType.BLOB), allowNull: false })
    url: Blob[]; // ошибочное состояние, но кое как можно сделать

    @Column({ type: DataType.BOOLEAN, allowNull: false })
    check: boolean;

    @HasOne(() => User, { sourceKey: 'user', foreignKey: 'user_id' })
    player: User;
}