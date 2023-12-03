import { BelongsTo, Column, DataType, HasOne, Model, Table } from "sequelize-typescript";
import { User } from "../users/users.model";
// import { User } from '../users/users.model';

@Table({tableName: 'markers'})
export class Markers extends Model<Markers> {
    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number; //INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

    @Column({ type: DataType.STRING, allowNull: false })
    id_type: string;

    @Column({ type: DataType.INTEGER, allowNull: false })
    x: number;

    @Column({ type: DataType.INTEGER, allowNull: false })
    y: number;

    @Column({ type: DataType.INTEGER, allowNull: false })
    z: number;

    @Column({ type: DataType.STRING, allowNull: false })
    name: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    description: string;

    @Column({ type: DataType.STRING, allowNull: false })
    user: string;

    @Column({ type: DataType.STRING, allowNull: true })
    server: string;

    @Column({ type: DataType.INTEGER, allowNull: false })
    flag: number;

    // @BelongsTo(() => User, {foreignKey: 'user', targetKey: 'user_id'})
    // player: User
    @HasOne(() => User, {sourceKey: 'user', foreignKey: 'user_id'})
    player: User;
}