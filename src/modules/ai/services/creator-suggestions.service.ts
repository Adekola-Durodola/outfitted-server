import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../user/entities/user.entity';
import { Video } from '../../videos/entities/video.entity';
import { VideoLike } from '../../videos/entities/video-like.entity';
import { UserPreferenceService, UserPreferenceProfile } from './user-preference.service';
import { CreatorAnalysisService, CreatorProfile } from './creator-analysis.service';
import { HuggingFaceService } from './huggingface.service';
import { CreatorSuggestionDto, VideoSuggestionDto } from '../dto/creator-suggestions.dto';
import { Op } from 'sequelize';

export interface CreatorSuggestionsRequest {
  userId: string;
  limit?: number;
  videosPerCreator?: number;
  recentOnly?: boolean;
}

export interface CreatorSuggestionsResponse {
  userId: string;
  suggestions: CreatorSuggestionDto[];
  totalSuggestions: number;
  generatedAt: Date;
  algorithm: string;
}

@Injectable()
export class CreatorSuggestionsService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Video) private videoModel: typeof Video,
    @InjectModel(VideoLike) private videoLikeModel: typeof VideoLike,
    private userPreferenceService: UserPreferenceService,
    private creatorAnalysisService: CreatorAnalysisService,
    private huggingFaceService: HuggingFaceService,
  ) {}

  async getCreatorSuggestions(request: CreatorSuggestionsRequest): Promise<CreatorSuggestionsResponse> {
    const { userId, limit = 10, videosPerCreator = 3, recentOnly = true } = request;

    const userProfile = await this.userPreferenceService.analyzeUserPreferences(userId);
    
    if (userProfile.activityScore < 0.1) {
      return this.getFallbackSuggestions(userId, limit);
    }

    const userContent = await this.getUserContentForAnalysis(userId);
    const userPreferenceVector = await this.huggingFaceService.generateUserPreferenceVector(userContent);
    
    const creatorProfiles = await this.getCandidateCreators(userId, limit * 2);
    
    const suggestions = await Promise.all(
      creatorProfiles.map(async (creator) => {
        const relevanceScore = await this.calculateRelevanceScore(
          userPreferenceVector,
          userProfile.preferredTags,
          userProfile.preferredStyles,
          creator
        );
        
        const recentVideos = await this.getCreatorRecentVideos(
          creator.userId,
          videosPerCreator,
          recentOnly
        );
        
        const reasons = this.generateSuggestionReasons(creator, userProfile, recentVideos);
        
        return {
          creatorId: creator.userId,
          name: creator.name,
          userName: creator.userName,
          bio: this.generateBio(creator),
          profilePic: creator.image || '',
          followers: creator.followerCount,
          following: creator.followingCount,
          videos: recentVideos,
          relevanceScore,
          reasons
        };
      })
    );

    const filteredSuggestions = suggestions
      .filter(s => s.relevanceScore > 0.1)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    return {
      userId,
      suggestions: filteredSuggestions,
      totalSuggestions: filteredSuggestions.length,
      generatedAt: new Date(),
      algorithm: 'ai-enhanced-creator-suggestions'
    };
  }

  private async getCandidateCreators(excludeUserId: string, limit: number): Promise<CreatorProfile[]> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const users = await this.userModel.findAll({
      where: {
        [Op.and]: [
          { id: { [Op.ne]: excludeUserId } },
          { onboarded: true },
          { createdAt: { [Op.lte]: thirtyDaysAgo } }
        ]
      },
      include: [
        { association: 'followers' },
        { association: 'following' },
        { association: 'videos' }
      ],
      limit: Math.min(limit, 1000),
      order: [['createdAt', 'DESC']]
    });

    return Promise.all(
      users.map(user => this.creatorAnalysisService.analyzeCreator(user.id))
    );
  }

  private async getCreatorRecentVideos(
    creatorId: string,
    limit: number,
    recentOnly: boolean
  ): Promise<VideoSuggestionDto[]> {
    const whereCondition: any = { userId: creatorId };
    
    if (recentOnly) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      whereCondition.createdAt = { [Op.gte]: thirtyDaysAgo };
    }

    const videos = await this.videoModel.findAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']],
      limit
    });

    return Promise.all(
      videos.map(async (video) => {
        const likes = await this.videoLikeModel.count({
          where: { videoId: video.id }
        });

        return {
          videoId: video.id,
          title: video.caption || video.description || 'Untitled',
          thumbnail: video.thumbnailUrl || '',
          mediaUrl: video.hlsUrl || video.url,
          views: video.views || 0,
          likes,
          createdAt: video.createdAt
        };
      })
    );
  }

  private async calculateRelevanceScore(
    userPreferenceVector: number[],
    userTags: string[],
    userStyles: string[],
    creator: CreatorProfile
  ): Promise<number> {
    let score = 0;
    
    const tagMatches = this.findMatchingTags(userTags, creator.contentThemes).length;
    const styleMatches = this.findMatchingStyles(userStyles, creator.styleSignatures).length;
    
    score += (tagMatches / Math.max(userTags.length, 1)) * 0.4;
    score += (styleMatches / Math.max(userStyles.length, 1)) * 0.3;
    score += creator.engagementScore * 0.2;
    score += creator.contentQuality * 0.1;
    
    return Math.min(score, 1);
  }

  private async getUserContentForAnalysis(userId: string): Promise<string[]> {
    const userProfile = await this.userPreferenceService.analyzeUserPreferences(userId);
    
    const content: string[] = [];
    userProfile.preferredTags.forEach(tag => content.push(tag));
    userProfile.preferredStyles.forEach(style => content.push(style));
    
    return content;
  }

  private generateSuggestionReasons(
    creator: CreatorProfile,
    userProfile: UserPreferenceProfile,
    videos: VideoSuggestionDto[]
  ): string[] {
    const reasons: string[] = [];

    if (creator.engagementScore > 0.7) {
      reasons.push('High engagement content');
    }

    if (creator.contentQuality > 0.6) {
      reasons.push('Quality content creator');
    }

    const matchingTags = this.findMatchingTags(userProfile.preferredTags, creator.contentThemes);
    if (matchingTags.length > 0) {
      reasons.push(`Similar interests: ${matchingTags.slice(0, 2).join(', ')}`);
    }

    const matchingStyles = this.findMatchingStyles(userProfile.preferredStyles, creator.styleSignatures);
    if (matchingStyles.length > 0) {
      reasons.push(`Matching style: ${matchingStyles[0]}`);
    }

    if (videos.length > 0) {
      const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
      const avgViews = totalViews / videos.length;
      if (avgViews > 1000) {
        reasons.push('Popular recent content');
      }
    }

    if (creator.activityLevel > 0.5) {
      reasons.push('Active creator');
    }

    return reasons.slice(0, 3);
  }

  private generateBio(creator: CreatorProfile): string {
    const themes = creator.contentThemes.slice(0, 3).join(', ');
    const styles = creator.styleSignatures.slice(0, 2).join(' & ');
    
    if (themes && styles) {
      return `Content creator focused on ${themes} with a ${styles} style`;
    } else if (themes) {
      return `Content creator focused on ${themes}`;
    } else if (styles) {
      return `Content creator with ${styles} style`;
    } else {
      return 'Fashion and lifestyle content creator';
    }
  }

  private findMatchingTags(userTags: string[], creatorThemes: string[]): string[] {
    return userTags.filter(tag => 
      creatorThemes.some(theme => 
        theme.toLowerCase().includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes(theme.toLowerCase())
      )
    );
  }

  private findMatchingStyles(userStyles: string[], creatorStyles: string[]): string[] {
    return userStyles.filter(style => 
      creatorStyles.some(creatorStyle => 
        creatorStyle.toLowerCase().includes(style.toLowerCase()) ||
        style.toLowerCase().includes(creatorStyle.toLowerCase())
      )
    );
  }

  private getFallbackSuggestions(userId: string, limit: number): CreatorSuggestionsResponse {
    return {
      userId,
      suggestions: [],
      totalSuggestions: 0,
      generatedAt: new Date(),
      algorithm: 'fallback-no-activity'
    };
  }
}
