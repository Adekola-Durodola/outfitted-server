import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, CreatedAt, UpdatedAt, HasMany } from 'sequelize-typescript';
import { User } from '../../user/entities/user.entity';
import { Bookmark } from '../../bookmarks/entities/bookmark.entity';
import { VideoLike } from './video-like.entity';
import { Comment } from './comment.entity';
import { Sound } from './sound.entity';
import { VideoStyle } from './video-style.entity';
import { ScrapedData } from './scraped-data.entity';

@Table({ tableName: 'videos' })
export class Video extends Model<Video> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

  @Column({ type: DataType.TEXT })
  url: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  caption?: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description?: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  views: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  hlsUrl?: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  thumbnailUrl?: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Sound)
  @Column({ type: DataType.UUID, allowNull: true })
  soundId?: string;

  @BelongsTo(() => Sound)
  sound: Sound;

  @HasMany(() => Bookmark)
  bookmarks: Bookmark[];

  @HasMany(() => VideoLike)
  likes: VideoLike[];

  @HasMany(() => Comment)
  comments: Comment[];

  @HasMany(() => VideoStyle)
  styles: VideoStyle[];

  @HasMany(() => ScrapedData)
  scrapedData: ScrapedData[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
