import { Table, Column, Model, DataType, PrimaryKey, Default, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({ tableName: 'sounds' })
export class Sound extends Model<Sound> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

  @Column({ type: DataType.TEXT })
  title: string;

  @Column({ type: DataType.TEXT })
  artist: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  url?: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  thumbnail?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  externalId?: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  embedUrl?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  duration?: string;

  @Column({ type: DataType.STRING, defaultValue: 'youtube' })
  sourceType: string;

  @Column({ type: DataType.INTEGER, defaultValue: 1 })
  usageCount: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
} 