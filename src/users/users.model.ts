import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { Markers } from "../markers/markers.model";
import { Awards } from '../awards/awards.model';
import { Territories } from "../territories/territories.model";

@Table({tableName: 'users'})
export class User extends Model<User> {
    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number; //INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

    @Column({ type: DataType.STRING, allowNull: true })
    username: string; //VARCHAR(100) NOT NULL UNIQUE,

    @Column({ type: DataType.STRING, allowNull: true })
    password: string; //VARCHAR(100) NOT NULL,

    @Column({ type: DataType.JSON, allowNull: false })
    tag: string; //VARCHAR(1000),

    @Column({ type: DataType.INTEGER, allowNull: false })
    type: number; //INT NOT NULL,

    @Column({ type: DataType.INTEGER, allowNull: false })
    age: number; //VARCHAR(10),

    @Column({ type: DataType.TEXT, allowNull: true })
    from_about: string; //TEXT,

    @Column({ type: DataType.TEXT, allowNull: false })
    you_about: string; //TEXT,

    @Column({ type: DataType.INTEGER, allowNull: false })
    status: number; //INT NOT NULL,

    @Column({ type: DataType.STRING, allowNull: false, primaryKey: true })
    user_id: string; //VARCHAR(100) NOT NULL UNIQUE,

    @Column({ type: DataType.STRING, allowNull: true })
    partner: string; //VARCHAR(255)

    @Column({ type: DataType.DATE, allowNull: true })
    reg_date: Date;

    @HasMany(() => Markers, {sourceKey: 'user_id', foreignKey: 'user'})
    markers: Markers[];

    @HasMany(() => Territories, {sourceKey: 'user_id', foreignKey: 'user'})
    territories: Territories;

    @HasMany(() => Awards, {sourceKey: 'user_id', foreignKey: 'user_id'})
    awards: Awards[];

    @Column({ type: DataType.BOOLEAN, allowNull: true })
    immun: boolean;

    @Column({ type: DataType.TEXT, allowNull: true })
    note: string;

    @Column({ type: DataType.DATE, allowNull: true })
    expiration_date: Date;

    @Column({ type: DataType.BOOLEAN, allowNull: true })
    is_discord: boolean;

    // @HasMany(() => Awards, {foreignKey: 'user_id'})
    // awards: Awards[];
}