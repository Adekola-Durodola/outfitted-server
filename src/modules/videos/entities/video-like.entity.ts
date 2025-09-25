import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, CreatedAt } from 'sequelize-typescript';
import { User } from '../../user/entities/user.entity';
import { Video } from './video.entity';

@Table({ 
  tableName: 'video_likes',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'videoId']
    }
  ]
})
export class VideoLike extends Model<VideoLike> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

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

  @CreatedAt
  createdAt: Date;
} 