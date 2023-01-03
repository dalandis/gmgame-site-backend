import { Column, DataType, HasOne, Model, Table } from "sequelize-typescript";
import { User } from '../users/users.model';

@Table({tableName: 'prize'})
export class Awards extends Model<Awards> {
    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number; //INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

    @Column({ type: DataType.STRING, allowNull: false })
    type: string;

    @Column({ type: DataType.INTEGER, allowNull: false })
    issued: number;

    @Column({ type: DataType.STRING, allowNull: false })
    user_id: string;

    @HasOne(() => User, {sourceKey: 'user_id', foreignKey: 'user_id'})
    user: User;

    // this.userModel.hasMany(this.awardsModel, {foreignKey: 'user_id'});
    // this.awardsModel.hasOne(this.userModel, {sourceKey: 'user_id', foreignKey: 'user_id'});
}