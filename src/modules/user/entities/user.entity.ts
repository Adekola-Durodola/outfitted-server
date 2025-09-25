import { Table, Column, Model, DataType, HasMany, PrimaryKey, Default } from 'sequelize-typescript';
import { Video } from '../../videos/entities/video.entity';
import { Collection } from '../../collections/entities/collection.entity';
import { Bookmark } from '../../bookmarks/entities/bookmark.entity';
import { UserPreference } from './user-preference.entity';
import { UserFollow } from './user-follow.entity';
import { UserOnboardingProgress } from './user-onboarding-progress.entity';

@Table({ tableName: 'users' })
export class User extends Model<User> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

  @Column({ type: DataType.STRING, allowNull: true, unique: true })
  email?: string;

  @Column({ type: DataType.STRING, allowNull: true, unique: true })
  userName?: string;

  @Column({ type: DataType.STRING, allowNull: false })
  password: string;

  @Column({ type: DataType.STRING, allowNull: true })
  name?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  image?: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  bio?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  tiktok?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  region?: string;

  @Column({ type: DataType.DATE, allowNull: true })
  dateOfBirth?: Date;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  onboarded: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  emailVerified: boolean;

  @Column({ type: DataType.STRING, allowNull: true })
  verificationCode: string;

  @Column({ type: DataType.DATE, allowNull: true })
  verificationCodeExpiry: Date;

  @Column({ type: DataType.STRING, allowNull: true })
  provider: string; // 'local', 'google', 'facebook', etc.

  @Column({ type: DataType.STRING, allowNull: true })
  providerId: string; // Google user ID

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  createdAt: Date;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  updatedAt: Date;

  @HasMany(() => Video)
  videos: Video[];

  @HasMany(() => Collection)
  collections: Collection[];

  @HasMany(() => Bookmark)
  bookmarks: Bookmark[];

  @HasMany(() => UserPreference, { as: 'preferences' })
  preferences: UserPreference[];

  @HasMany(() => UserFollow, { as: 'following', foreignKey: 'followerId' })
  following: UserFollow[];

  @HasMany(() => UserFollow, { as: 'followers', foreignKey: 'followingId' })
  followers: UserFollow[];

  @HasMany(() => UserOnboardingProgress, { as: 'onboardingProgress' })
  onboardingProgress: UserOnboardingProgress[];
}
