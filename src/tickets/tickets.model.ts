import { Column, DataType, HasOne, Model, Table } from 'sequelize-typescript';
import { User } from '../users/users.model';

@Table({ tableName: 'tickets' })
export class Tickets extends Model<Tickets> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number; //INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

  @Column({ type: DataType.STRING, allowNull: false })
  user_id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @HasOne(() => User, { sourceKey: 'user_id', foreignKey: 'user_id' })
  user: User;
}
