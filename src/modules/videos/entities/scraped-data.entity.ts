import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Video } from './video.entity';
import { User } from '../../user/entities/user.entity';

@Table({ tableName: 'scraped_data' })
export class ScrapedData extends Model<ScrapedData> {
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

  @Column({ type: DataType.JSON })
  productsData: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
} 