import { Column, DataType, HasOne, Model, Table } from 'sequelize-typescript';
import { FaqDescription } from './faqDescription.model';

@Table({ tableName: 'faq' })
export class Faq extends Model<Faq> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number; //INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

  @Column({ type: DataType.STRING, allowNull: false, unique: 'compositeIndex' })
  quest: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  answer: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false })
  show: boolean;

  @Column({ type: DataType.STRING, allowNull: true })
  category: string;

  @HasOne(() => FaqDescription, {
    sourceKey: 'category',
    foreignKey: 'category',
  })
  faqDescription: FaqDescription;
}
