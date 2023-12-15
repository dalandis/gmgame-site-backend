import { Column, DataType, HasOne, Model, Table } from "sequelize-typescript";
import { User } from '../users/users.model';

@Table({tableName: 'articles'})
export class Articles extends Model<Articles> {
    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number; //INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

    @Column({ type: DataType.STRING, allowNull: false })
    title: string;

    @Column({ type: DataType.TEXT('medium'), allowNull: false })
    content: string;

    @Column({ type: DataType.STRING, allowNull: false, primaryKey: true })
    user_id: string;

    @Column({ type: DataType.STRING, allowNull: true })
    preview_img: string;

    @Column({ type: DataType.NUMBER, allowNull: true })
    category: number;

    @Column({ type: DataType.NUMBER, allowNull: true })
    visible: number;

    @HasOne(() => User, {sourceKey: 'user_id', foreignKey: 'user_id'})
    user: User;

    // this.userModel.hasMany(this.awardsModel, {foreignKey: 'user_id'});
    // this.awardsModel.hasOne(this.userModel, {sourceKey: 'user_id', foreignKey: 'user_id'});
}