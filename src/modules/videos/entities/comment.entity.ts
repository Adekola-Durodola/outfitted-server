import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, CreatedAt, UpdatedAt, HasMany } from 'sequelize-typescript';
import { User } from '../../user/entities/user.entity';
import { Video } from './video.entity';
import { CommentReply } from './comment-reply.entity';

@Table({ tableName: 'comments' })
export class Comment extends Model<Comment> {
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

  @ForeignKey(() => Video)
  @Column({ type: DataType.UUID })
  videoId: string;

  @BelongsTo(() => Video)
  video: Video;

  @HasMany(() => CommentReply)
  replies: CommentReply[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
} 