import { Column, DataType, HasOne, Model, Table } from "sequelize-typescript";
import { User } from '../users/users.model';

@Table({tableName: 'territories'})
export class Territories extends Model<Territories> {
    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number; //INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

    @Column({ type: DataType.INTEGER, allowNull: false })
    xStart: number;

    @Column({ type: DataType.INTEGER, allowNull: false })
    zStart: number;

    @Column({ type: DataType.INTEGER, allowNull: false })
    xStop: number;

    @Column({ type: DataType.INTEGER, allowNull: false })
    zStop: number;

    @Column({ type: DataType.STRING, allowNull: false })
    name: string;

    @Column({ type: DataType.STRING, allowNull: false })
    user: string;

    @Column({ type: DataType.STRING, allowNull: true })
    world: string;

    @HasOne(() => User, {sourceKey: 'user', foreignKey: 'user_id'})
    player: User;
    
    username: string;

    @Column({ type: DataType.STRING, allowNull: true })
    status: string;
}