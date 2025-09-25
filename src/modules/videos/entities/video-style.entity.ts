import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Video } from './video.entity';

@Table({ tableName: 'video_styles' })
export class VideoStyle extends Model<VideoStyle> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

  @ForeignKey(() => Video)
  @Column({ type: DataType.UUID })
  videoId: string;

  @BelongsTo(() => Video)
  video: Video;

  @Column({ type: DataType.TEXT })
  name: string;

  @Column({ type: DataType.STRING })
  styleId: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
} 