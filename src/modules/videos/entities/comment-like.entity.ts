import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, CreatedAt, Unique } from 'sequelize-typescript';
import { User } from '../../user/entities/user.entity';
import { Comment } from './comment.entity';

@Table({ 
  tableName: 'comment_likes',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'commentId']
    }
  ]
})
export class CommentLike extends Model<CommentLike> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Comment)
  @Column({ type: DataType.UUID })
  commentId: string;

  @BelongsTo(() => Comment)
  comment: Comment;

  @CreatedAt
  createdAt: Date;
} 