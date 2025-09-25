import { Table, Column, Model, DataType, PrimaryKey, Default } from 'sequelize-typescript';

@Table({ tableName: 'video_analysis', timestamps: false })
export class VideoAnalysis extends Model<VideoAnalysis> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

  @Column({ type: DataType.ARRAY(DataType.STRING), field: 'auto_hashtags', allowNull: true })
  autoHashtags?: string[];

  @Column({ type: DataType.ARRAY(DataType.STRING), field: 'style_categories', allowNull: true })
  styleCategories?: string[];

  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt: Date;
} 