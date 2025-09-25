import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.entity';

@Table({ tableName: 'user_preferences' })
class UserPreference extends Model<UserPreference> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  userId: string;

  @BelongsTo(() => User, { as: 'user' })
  user: User;

  @Column({ type: DataType.STRING })
  preferenceType: string; // e.g., 'style'

  @Column({ type: DataType.STRING })
  preferenceValue: string;

  @Column({ type: DataType.FLOAT, defaultValue: 1.0 })
  weight: number;

  @Column({ type: DataType.STRING, allowNull: true })
  source?: string;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  createdAt: Date;
}

export { UserPreference }; 