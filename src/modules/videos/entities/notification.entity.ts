import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, CreatedAt } from 'sequelize-typescript';
import { User } from '../../user/entities/user.entity';

@Table({ tableName: 'notifications' })
export class Notification extends Model<Notification> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  recipientId: string;

  @BelongsTo(() => User, 'recipientId')
  recipient: User;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  senderId: string;

  @BelongsTo(() => User, 'senderId')
  sender: User;

  @Column({ type: DataType.STRING })
  type: string; // e.g., 'comment_like'

  @Column({ type: DataType.UUID })
  contentId: string;

  @Column({ type: DataType.STRING })
  contentPreview: string;

  @CreatedAt
  createdAt: Date;
} 