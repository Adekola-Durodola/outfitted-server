import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, Unique, BelongsTo } from 'sequelize-typescript';
import { User } from './user.entity';

@Table({ tableName: 'user_onboarding_progress' })
export class UserOnboardingProgress extends Model<UserOnboardingProgress> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

  @ForeignKey(() => User)
  @Unique
  @Column({ type: DataType.UUID })
  userId: string;

  @BelongsTo(() => User, { as: 'user' })
  user: User;

  @Column({ type: DataType.DATE, allowNull: true })
  dateOfBirth?: Date;

  @Column({ type: DataType.STRING, allowNull: true })
  userName?: string;

  @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: true })
  styles?: string[];

  @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: true })
  followedCreators?: string[];

  @Column({ type: DataType.INTEGER, allowNull: true })
  currentStep?: number;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  updatedAt: Date;
} 