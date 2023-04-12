import { Column, DataType, HasOne, Model, Table } from "sequelize-typescript";
// import { User } from '../users/users.model';

@Table({tableName: 'regens'})
export class Regens extends Model<Regens> {
    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number; //INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

    @Column({ type: DataType.STRING, allowNull: false })
    user_id: string;

    @Column({ type: DataType.STRING, allowNull: false})
    status: string;

    @Column({ type: DataType.STRING, allowNull: false})
    username: string;
}