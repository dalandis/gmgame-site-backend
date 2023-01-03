import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { Awards } from '../awards/awards.model';

@Table({tableName: 'users'})
export class User extends Model<User> {
    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number; //INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

    @Column({ type: DataType.STRING, unique: true, allowNull: false })
    username: string; //VARCHAR(100) NOT NULL UNIQUE,

    @Column({ type: DataType.STRING, allowNull: false })
    password: string; //VARCHAR(100) NOT NULL,

    @Column({ type: DataType.JSON, allowNull: false })
    tag: string; //VARCHAR(1000),

    @Column({ type: DataType.INTEGER, allowNull: false })
    type: number; //INT NOT NULL,

    @Column({ type: DataType.INTEGER, allowNull: false })
    age: number; //VARCHAR(10),

    @Column({ type: DataType.STRING, allowNull: false })
    from_about: string; //TEXT,

    @Column({ type: DataType.STRING, allowNull: false })
    you_about: string; //TEXT,

    @Column({ type: DataType.INTEGER, allowNull: false })
    status: number; //INT NOT NULL,

    @Column({ type: DataType.STRING, allowNull: false })
    user_id: string; //VARCHAR(100) NOT NULL UNIQUE,

    @Column({ type: DataType.STRING, allowNull: true })
    partner: string; //VARCHAR(255)

    @Column({ type: DataType.DATE, allowNull: true })
    reg_date: number;

    // @HasMany(() => Awards, {foreignKey: 'user_id'})
    // awards: Awards[];
}