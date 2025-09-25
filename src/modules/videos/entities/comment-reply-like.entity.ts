import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, CreatedAt } from 'sequelize-typescript';
import { User } from '../../user/entities/user.entity';
import { CommentReply } from './comment-reply.entity';

@Table({ 
  tableName: 'comment_reply_likes',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'commentReplyId']
    }
  ]
})
export class CommentReplyLike extends Model<CommentReplyLike> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => CommentReply)
  @Column({ type: DataType.UUID })
  commentReplyId: string;

  @BelongsTo(() => CommentReply)
  commentReply: CommentReply;

  @CreatedAt
  createdAt: Date;
} 