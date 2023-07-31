import { Column, DataType, HasOne, Model, Table } from "sequelize-typescript";

@Table({tableName: 'goals'})
export class Goals extends Model<Goals> {
    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number; //INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

    @Column({ type: DataType.STRING, allowNull: false})
    title: string;

    @Column({ type: DataType.TEXT, allowNull: false })
    description: string;

    @Column({ type: DataType.BOOLEAN, allowNull: false})
    archived: boolean;

    @Column({ type: DataType.DATE, allowNull: true})
    endTime: Date;

    @Column({ type: DataType.INTEGER, allowNull: false})
    accum: number;

    @Column({ type: DataType.INTEGER, allowNull: false})
    goal: number;
}