import { Column, DataType, HasOne, Model, Table } from "sequelize-typescript";
import { User } from '../users/users.model';

@Table({tableName: 'logs'})
export class Logs extends Model<Logs> {
    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number; //INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

    @Column({ type: DataType.STRING, allowNull: false })
    log: string;

    @Column({ type: DataType.STRING, allowNull: false })
    user_id: string;

    @Column({ type: DataType.STRING, allowNull: false})
    manager: string;

    @Column({ type: DataType.STRING, allowNull: true})
    managerId: string;

    @Column({ type: DataType.DATE, allowNull: false})
    log_date: Date;

    @Column({ type: DataType.STRING, allowNull: true})
    type: string;

    // @HasOne(() => User, {sourceKey: 'user_id', foreignKey: 'user_id'})
    // user: User;

    // this.userModel.hasMany(this.awardsModel, {foreignKey: 'user_id'});
    // this.awardsModel.hasOne(this.userModel, {sourceKey: 'user_id', foreignKey: 'user_id'});
}