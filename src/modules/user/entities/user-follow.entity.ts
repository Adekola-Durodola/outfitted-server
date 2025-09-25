import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.entity';

@Table({ tableName: 'user_follows' })
export class UserFollow extends Model<UserFollow> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  followerId: string;

  @BelongsTo(() => User, { as: 'follower' })
  follower: User;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  followingId: string;

  @BelongsTo(() => User, { as: 'following' })
  following: User;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  createdAt: Date;
} 