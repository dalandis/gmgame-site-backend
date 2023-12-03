import { Column, DataType, Model, Table, HasMany } from "sequelize-typescript";
import { Faq } from "./faq.model";

@Table({tableName: 'faqDescription'})
export class FaqDescription extends Model<FaqDescription> {
    @Column({ type: DataType.STRING, allowNull: false })
    descryption: string;

    @Column({ type: DataType.STRING, allowNull: false, unique: true, primaryKey: true})
    category: string;

    // @HasMany(() => Faq, {sourceKey: 'category', foreignKey: 'category'})
    // markers: Faq[];
}
