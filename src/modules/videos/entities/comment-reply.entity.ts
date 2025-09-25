import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { User } from '../../user/entities/user.entity';
import { Comment } from './comment.entity';

@Table({ tableName: 'comment_replies' })
export class CommentReply extends Model<CommentReply> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

  @Column({ type: DataType.TEXT })
  content: string;

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

  @UpdatedAt
  updatedAt: Date;
} 