import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({tableName: 'donate_status'})
export class DonateStatus extends Model<DonateStatus> {
    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @Column({ type: DataType.INTEGER, allowNull: false })
    current: number;
    
    @Column({ type: DataType.INTEGER, allowNull: false })
    full: number;

    @Column({ type: DataType.BOOLEAN, allowNull: false })
    viewing: boolean;
}