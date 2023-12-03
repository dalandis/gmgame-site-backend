import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({tableName: 'faqSortable'})
export class FaqSortable extends Model<FaqSortable> {
    @Column({ type: DataType.STRING, unique: false, primaryKey: true })
    sortableIds: string;
}