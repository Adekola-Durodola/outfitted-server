import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Req, UseGuards, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OnboardingDto } from './dto/onboarding.dto';
import { OnboardingProgressDto } from './dto/onboarding-progress.dto';
import { Request } from 'express';
import { validate as classValidate, ValidationError } from 'class-validator';
import { UsernameCheckDto } from './dto/username-check.dto';
import { UserDto } from './dto/user.dto';
import { ApiOperation, ApiProperty, ApiTags, ApiResponse } from '@nestjs/swagger';

type JwtRequest = Request & { user?: { userId: string } };

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user', description: 'Create a new user account and receive authentication tokens' })
  @ApiProperty({ description: 'Create a new user', type: CreateUserDto })
  create(@Body() dto: CreateUserDto): Promise<UserDto> {
    return this.userService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users', description: 'Get all users' })
  @ApiProperty({ description: 'Get all users', type: [UserDto] })
  findAll(): Promise<UserDto[]> {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Put('follow')
  follow(@Body() body: { userId: string; creatorId: string }) {
    return this.userService.followUser(body.userId, body.creatorId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('unfollow')
  unfollow(@Body() body: { userId: string; creatorId: string }) {
    return this.userService.unfollowUser(body.userId, body.creatorId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('onboarding-progress')
  async saveOnboardingProgress(
    @Body() dto: OnboardingProgressDto,
    @Req() req: JwtRequest
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }
    try {
      const progress = await this.userService.saveOnboardingProgress(userId, dto);
      return { message: 'Progress saved successfully', data: progress };
    } catch (error) {
      return { error: error.message };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('onboarding-progress')
  async getOnboardingProgress(@Req() req: JwtRequest) {
    const userId = req.user?.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }
    try {
      const progress = await this.userService.getOnboardingProgress(userId);
      return { progress, message: progress ? 'Progress loaded' : 'No progress found' };
    } catch (error) {
      return { error: error.message };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('onboard')
  async onboard(
    @Body() dto: OnboardingDto,
    @Req() req: JwtRequest
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }
    try {
      const user = await this.userService.onboardUser(userId, dto);
      return { message: 'Onboarding completed successfully', user };
    } catch (error) {
      return { error: error.message };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('onboarding-status')
  async getOnboardingStatus(@Req() req: JwtRequest) {
    const userId = req.user?.userId;
    // Email is not present in JWT by default; pass undefined
    // If you add email to JWT, you can extract it here
    if (!userId) {
      return { error: 'Unauthorized' };
    }
    try {
      const status = await this.userService.getOnboardingStatus(userId, undefined);
      return status;
    } catch (error) {
      return { error: error.message };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('check-username')
  async checkUsername(@Query('username') username: string, @Req() req: JwtRequest) {
    if (!username) {
      return { error: 'Username parameter is required' };
    }
    // Validate username format (same as onboarding)
    const dto = { userName: username };
    const checkDto = Object.assign(new UsernameCheckDto(), dto);
    const errors: ValidationError[] = await classValidate(checkDto);
    if (errors.length > 0) {
      return {
        available: false,
        error: 'Username must be 3-30 characters and contain only letters, numbers, periods, and underscores',
      };
    }
    // Check if username exists
    const existingUser = await this.userService.findUserByUserName(username);
    // Check if it's the current user's existing username
    const userId = req.user?.userId;
    let isCurrentUser = false;
    if (userId && existingUser) {
      const currentUser = await this.userService.findUserById(userId);
      isCurrentUser = currentUser?.userName?.toLowerCase() === username.toLowerCase();
    }
    
    // Debug information
    const debug = {
      searchedUsername: username,
      existingUserFound: !!existingUser,
      existingUserUsername: existingUser?.userName,
      currentUserId: userId,
      isCurrentUser,
      available: !existingUser || isCurrentUser
    };
    
    return {
      available: !existingUser || isCurrentUser,
      username,
      debug // Remove this in production
    };
  }

  // ===== PROFILE ROUTES =====
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: JwtRequest) {
    const userId = req.user?.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }
    return this.userService.getUserProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Body() updateProfileDto: any, @Req() req: JwtRequest) {
    const userId = req.user?.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }
    return this.userService.updateUserProfile(userId, updateProfileDto);
  }

  // ===== PROFILE PHOTO ROUTES =====
  @UseGuards(JwtAuthGuard)
  @Post('profile-photo/upload-url')
  async getProfilePhotoUploadUrl(@Body() dto: any, @Req() req: JwtRequest) {
    const userId = req.user?.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }
    return this.userService.getProfilePhotoUploadUrl(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile-photo')
  async updateProfilePhoto(@Body() dto: any, @Req() req: JwtRequest) {
    const userId = req.user?.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }
    return this.userService.updateProfilePhoto(userId, dto);
  }

  // ===== RELATIONSHIPS ROUTES =====
  @UseGuards(JwtAuthGuard)
  @Get('followers')
  async getFollowers(@Req() req: JwtRequest) {
    const userId = req.user?.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }
    return this.userService.getFollowers(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('following')
  async getFollowing(@Req() req: JwtRequest) {
    const userId = req.user?.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }
    return this.userService.getFollowing(userId);
  }

  // ===== SETTINGS ROUTES =====
  @UseGuards(JwtAuthGuard)
  @Put('settings/date-of-birth')
  async updateDateOfBirth(@Body() dto: any, @Req() req: JwtRequest) {
    const userId = req.user?.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }
    return this.userService.updateUserDateOfBirth(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('settings/deactivate')
  async deactivateAccount(@Body() dto: any, @Req() req: JwtRequest) {
    const userId = req.user?.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }
    return this.userService.deactivateAccount(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('settings/delete')
  async deleteAccount(@Body() dto: any, @Req() req: JwtRequest) {
    const userId = req.user?.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }
    return this.userService.deleteAccount(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('settings/region')
  async updateRegion(@Body() dto: any, @Req() req: JwtRequest) {
    const userId = req.user?.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }
    return this.userService.updateUserRegion(userId, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findUserById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUserById(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUserById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/suggested-creators')
  @ApiOperation({ summary: 'Get suggested creators for a user', description: 'Redirects to AI service for creator suggestions' })
  @ApiResponse({ status: 307, description: 'Redirects to /ai/creator-suggestions' })
  async getSuggestedCreators(
    @Param('id') userId: string,
    @Query('limit') limit?: number,
    @Query('videosPerCreator') videosPerCreator?: number,
    @Query('recentOnly') recentOnly?: boolean
  ) {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.set('limit', limit.toString());
    if (videosPerCreator) queryParams.set('videosPerCreator', videosPerCreator.toString());
    if (recentOnly !== undefined) queryParams.set('recentOnly', recentOnly.toString());
    
    const redirectUrl = `/ai/creator-suggestions?${queryParams.toString()}`;
    
    return {
      message: 'Please use the AI endpoint for creator suggestions',
      redirectUrl,
      requestBody: {
        userId,
        limit: limit || 10,
        videosPerCreator: videosPerCreator || 3,
        recentOnly: recentOnly !== false
      }
    };
  }
}
