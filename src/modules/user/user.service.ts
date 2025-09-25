import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { UserFollow } from './entities/user-follow.entity';
import * as bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { UserPreference } from './entities/user-preference.entity';
import { OnboardingDto } from './dto/onboarding.dto';
import { Sequelize } from 'sequelize-typescript';
import { Inject } from '@nestjs/common';
import { UserOnboardingProgress } from './entities/user-onboarding-progress.entity';
import { OnboardingProgressDto } from './dto/onboarding-progress.dto';
import { UserDto } from './dto/user.dto';
import { S3Service } from '../../client/s3/s3.service';
import { ApiResponseDto } from 'src/resources/dto/api-response.dto';
import { MailService } from '../../client/mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(UserFollow) private followModel: typeof UserFollow,
    @InjectModel(UserPreference) private preferenceModel: typeof UserPreference,
    @InjectModel(UserOnboardingProgress) private onboardingProgressModel: typeof UserOnboardingProgress,
    @Inject(Sequelize) private sequelize: Sequelize,
    private s3Service: S3Service,
    private mailService: MailService,
  ) {}

  // create user
  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const { password, ...data } = createUserDto as any;
    const hashed = await bcrypt.hash(password, 10);
    return new UserDto(await this.userModel.create({ ...data, password: hashed, provider: 'local' } as any));
  }

  // create Google user
  async createGoogleUser(googleSignupDto: any): Promise<UserDto> {
    const userData = {
      email: googleSignupDto.email,
      name: googleSignupDto.name,
      userName: googleSignupDto.userName,
      image: googleSignupDto.avatar,
      provider: 'google',
      providerId: googleSignupDto.providerId,
      emailVerified: true, // Google emails are pre-verified
      onboarded: false,
    };

    return new UserDto(await this.userModel.create(userData as any));
  }

  // find all users
  async findAll(): Promise<UserDto[]> {
    const users = await this.userModel.findAll({ order: [['createdAt', 'DESC']] });
    return (users).map(user => new UserDto(user));
  }

  // find one user by id
  async findUserById(id: string): Promise<UserDto> {
    const user = await this.userModel.findByPk(id);
    return new UserDto(user);
  }

  // update user by id
  async updateUserById(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new Error('User not found');
    await user.update(updateUserDto);
    return new UserDto(user);
  }

  // delete user by id
  async deleteUserById(id: string) {
    return this.userModel.destroy({ where: { id } });
  }

  // follow user
  async followUser(userId: string, creatorId: string) {
    const existing = await this.followModel.findOne({ where: { followerId: userId, followingId: creatorId } });
    if (existing) return existing;
    return this.followModel.create({ followerId: userId, followingId: creatorId });
  }

  // unfollow user
  async unfollowUser(userId: string, creatorId: string) {
    return this.followModel.destroy({ where: { followerId: userId, followingId: creatorId } });
  }

  // find user by email
  async findUserByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ where: { [Op.or]: [{ email: email }] } });
  }

  // find user by provider ID
  async findUserByProviderId(providerId: string): Promise<User> {
    return this.userModel.findOne({ where: { providerId } });
  }

  async onboardUser(userId: string, dto: OnboardingDto) {
    // Check if user exists and is already onboarded
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new Error('User not found');
    if (user.onboarded) throw new Error('User is already onboarded');

    // Check if username is available (unless it's the current username)
    if (dto.userName.toLowerCase() !== user.userName?.toLowerCase()) {
      const existingUsername = await this.findUserByUserName(dto.userName);
      if (existingUsername) throw new Error('Username is already taken');
    }

    // Validate age (must be 13 or older)
    const birthDate = new Date(dto.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 13) throw new Error('You must be at least 13 years old to use this platform');

    // Transaction: update user, create preferences, follow creators
    return this.sequelize.transaction(async (t) => {
      // Update user
      await user.update({
        dateOfBirth: birthDate,
        userName: dto.userName,
        onboarded: true,
      }, { transaction: t });

      // Create style preferences
      const stylePreferences = dto.styles.map((style) => ({
        userId: userId,
        preferenceType: 'style',
        preferenceValue: style.toLowerCase(),
        weight: 1.0,
        source: 'onboarding',
      }));
      if (stylePreferences.length > 0) {
        await this.preferenceModel.bulkCreate(stylePreferences, { transaction: t, ignoreDuplicates: true });
      }

      // Create follow relationships if provided
      if (dto.followedCreators && dto.followedCreators.length > 0) {
        const followData = dto.followedCreators.map((creatorId) => ({
          followerId: userId,
          followingId: creatorId,
        }));
        await this.followModel.bulkCreate(followData, { transaction: t, ignoreDuplicates: true });
      }

      return user;
    });
  }

  async getOnboardingProgress(userId: string) {
    return this.onboardingProgressModel.findOne({ where: { userId } });
  }

  async saveOnboardingProgress(userId: string, dto: OnboardingProgressDto) {
    // Upsert progress
    const upsertData: any = {
      userId,
      ...dto,
      updatedAt: new Date(),
    };

    // Ensure dateOfBirth is a Date object if present
    if (upsertData.dateOfBirth && typeof upsertData.dateOfBirth === 'string') {
      upsertData.dateOfBirth = new Date(upsertData.dateOfBirth);
    }
    const [progress] = await this.onboardingProgressModel.upsert(upsertData);
    return progress;
  }

  async getOnboardingStatus(userId: string, userEmail?: string) {
    // Fetch user with preferences (source: 'onboarding') and following
    const user = await this.userModel.findByPk(userId, {
      attributes: ['id', 'email', 'userName', 'dateOfBirth', 'onboarded', 'createdAt'],
      include: [
        {
          model: this.preferenceModel,
          as: 'preferences',
          where: { source: 'onboarding' },
          required: false,
          attributes: ['preferenceType', 'preferenceValue'],
        },
        {
          model: this.followModel,
          as: 'following',
          attributes: ['followingId'],
          required: false,
        },
      ],
    });
    if (!user) throw new Error('User not found');

    // Debug info
    const debugInfo = {
      hasDateOfBirth: !!user.dateOfBirth,
      hasCustomUsername: user.userName && userEmail ? user.userName !== userEmail.split('@')[0] : false,
      hasOnboardingPreferences: Array.isArray((user as any).preferences) && (user as any).preferences.length > 0,
      followingCount: Array.isArray((user as any).following) ? (user as any).following.length : 0,
      isDefaultUsername: user.userName && userEmail ? user.userName === userEmail.split('@')[0] : false,
    };
    return {
      user,
      debugInfo,
      needsOnboarding:
        !user.onboarded &&
        (!user.dateOfBirth || !user.userName || debugInfo.isDefaultUsername),
    };
  }

  async findUserByUserName(userName: string) {
    return this.userModel.findOne({ 
      where: { 
        userName: {
          [Op.iLike]: userName // ase-insensitive search
        }
      } 
    });
  }

  // ===== PROFILE METHODS =====
  async getUserProfile(userId: string): Promise<UserDto> {
    const user = await this.userModel.findByPk(userId, {
      include: [
        'following',
        'followers'
      ]
    });
    
    if (!user) throw new Error('User not found');
    return new UserDto(user);
  }

  async updateUserProfile(userId: string, updateProfileDto: any) {
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new Error('User not found');

    // check username availability if username is being updated
    if (updateProfileDto.userName && updateProfileDto.userName !== user.userName) {
      const existingUser = await this.findUserByUserName(updateProfileDto.userName);
      if (existingUser) {
        throw new Error('Username is already taken');
      }
    }
    await user.update(updateProfileDto);
    return this.getUserProfile(userId);
  }

  async getProfilePhotoUploadUrl(userId: string, dto: any) {
    return await this.s3Service.generateProfilePhotoUploadUrl(userId, dto);
  }

  async updateProfilePhoto(userId: string, dto: any) {
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new Error('User not found');
    await user.update({ image: dto.imageUrl });
    return this.getUserProfile(userId);
  }

  async getFollowers(userId: string) {
    const followers = await this.followModel.findAll({
      where: { followingId: userId },
      include: [
        {
          model: User,
          as: 'follower',
          attributes: ['id', 'userName', 'name', 'image']
        }
      ]
    });
    return followers.map(follow => follow.follower);
  }

  async getFollowing(userId: string) {
    const following = await this.followModel.findAll({
      where: { followerId: userId },
      include: [
        {
          model: User,
          as: 'following',
          attributes: ['id', 'userName', 'name', 'image']
        }
      ]
    });
    return following.map(follow => follow.following);
  }

  async updateUserDateOfBirth(userId: string, dto: any) {
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new Error('User not found');

    const birthDate = new Date(dto.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 13) {
      throw new Error('You must be at least 13 years old');
    }
    await user.update({ dateOfBirth: birthDate });
    return this.getUserProfile(userId);
  }

  async deactivateAccount(userId: string, dto: any): Promise<ApiResponseDto> {
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new Error('User not found');

    // Verify password
    const isValidPassword = await bcrypt.compare(dto.password, user.password);
    if (!isValidPassword) throw new Error('Invalid password');

    // Log the deactivation feedback (TODO: add to feedback table)
    console.log(`User ${userId} deactivated account. Feedback: ${dto.feedback}`);
    return new ApiResponseDto('Account deactivated successfully');
  }

  async deleteAccount(userId: string, dto: any): Promise<ApiResponseDto> {
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new Error('User not found');
    // Verify password
    const isValidPassword = await bcrypt.compare(dto.password, user.password);
    if (!isValidPassword) throw new Error('Invalid password');

    // Log the deletion feedback
    console.log(`User ${userId} deleted account. Feedback: ${dto.feedback}`);
    await this.userModel.destroy({ where: { id: userId } });
    return new ApiResponseDto('Account deleted successfully');
  }

  async updateUserRegion(userId: string, dto: any) {
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new Error('User not found');
    await user.update({ region: dto.region });
    return this.getUserProfile(userId);
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationEmail(userId: string): Promise<void> {
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new Error('User not found');
    if (user.emailVerified) throw new Error('Email already verified');

    const verificationCode = this.generateVerificationCode();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await user.update({
      verificationCode,
      verificationCodeExpiry: expiryTime,
    });

    await this.mailService.sendVerificationEmail(
      user.email,
      verificationCode,
      user.userName || user.name
    );
  }

  async verifyEmail(email: string, verificationCode: string): Promise<boolean> {
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) throw new Error('User not found');
    if (user.emailVerified) throw new Error('Email already verified');

    const now = new Date();
    if (!user.verificationCode || !user.verificationCodeExpiry) {
      throw new Error('No verification code found');
    }

    if (user.verificationCodeExpiry < now) {
      throw new Error('Verification code has expired');
    }

    if (user.verificationCode !== verificationCode) {
      throw new Error('Invalid verification code');
    }

    await user.update({
      emailVerified: true,
      verificationCode: null,
      verificationCodeExpiry: null,
    });

    return true;
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) throw new Error('User not found');
    if (user.emailVerified) throw new Error('Email already verified');

    await this.sendVerificationEmail(user.id);
  }

}
