import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { User } from '../../user/entities/user.entity';
import { Video } from '../../videos/entities/video.entity';
import { Collection } from '../../collections/entities/collection.entity';

@Table({ tableName: 'bookmarks' })
export class Bookmark extends Model<Bookmark> {
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

  @ForeignKey(() => Collection)
  @Column({ type: DataType.UUID, allowNull: true })
  collectionId?: string;

  @BelongsTo(() => Collection)
  collection: Collection;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
