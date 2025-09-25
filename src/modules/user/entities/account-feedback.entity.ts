import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.entity';

@Table({ tableName: 'account_feedback' })
export class AccountFeedback extends Model<AccountFeedback> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @Column({ type: DataType.STRING, allowNull: true })
  userEmail?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  userName?: string;

  @Column({ type: DataType.STRING })
  actionType: string; // e.g., 'deactivation'

  @Column({ type: DataType.TEXT })
  reason: string;

  @Column({ type: DataType.STRING, allowNull: true })
  userAgent?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  ipAddress?: string;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  createdAt: Date;
} 