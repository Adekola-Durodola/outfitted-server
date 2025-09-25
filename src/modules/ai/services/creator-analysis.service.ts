import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../user/entities/user.entity';
import { Video } from '../../videos/entities/video.entity';
import { VideoAnalysis } from '../entities/video-analysis.entity';
import { HuggingFaceService } from './huggingface.service';
import { Op } from 'sequelize';

export interface CreatorProfile {
  userId: string;
  userName: string;
  name: string;
  image?: string;
  contentThemes: string[];
  styleSignatures: string[];
  engagementScore: number;
  contentQuality: number;
  activityLevel: number;
  followerCount: number;
  followingCount: number;
  videoCount: number;
  averageViews: number;
  lastActiveAt: Date;
}

export interface CreatorRecommendation {
  creator: CreatorProfile;
  relevanceScore: number;
  reasons: string[];
  matchTags: string[];
  matchStyles: string[];
}

@Injectable()
export class CreatorAnalysisService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Video) private videoModel: typeof Video,
    @InjectModel(VideoAnalysis) private analysisModel: typeof VideoAnalysis,
    private huggingFaceService: HuggingFaceService,
  ) {}

  async analyzeCreator(userId: string): Promise<CreatorProfile> {
    const [user, videos, analyses] = await Promise.all([
      this.userModel.findByPk(userId, {
        include: [
          { association: 'followers' },
          { association: 'following' }
        ]
      }),
      this.getCreatorVideos(userId),
      this.getCreatorVideoAnalyses(userId)
    ]);

    if (!user) {
      throw new Error('Creator not found');
    }

    const contentThemes = this.extractContentThemes(videos, analyses);
    const styleSignatures = this.extractStyleSignatures(analyses);
    const engagementScore = this.calculateEngagementScore(videos);
    const contentQuality = this.calculateContentQuality(videos, analyses);
    const activityLevel = this.calculateActivityLevel(videos);
    const averageViews = this.calculateAverageViews(videos);

    return {
      userId: user.id,
      userName: user.userName || '',
      name: user.name || '',
      image: user.image,
      contentThemes,
      styleSignatures,
      engagementScore,
      contentQuality,
      activityLevel,
      followerCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
      videoCount: videos.length,
      averageViews,
      lastActiveAt: this.getLastActivityDate(videos)
    };
  }

  async findSimilarCreators(targetCreatorId: string, limit: number = 10): Promise<CreatorProfile[]> {
    const targetProfile = await this.analyzeCreator(targetCreatorId);
    const allCreators = await this.getAllActiveCreators();
    
    const similarities = await Promise.all(
      allCreators
        .filter(creator => creator.userId !== targetCreatorId)
        .map(async (creator) => {
          const similarity = await this.calculateCreatorSimilarity(targetProfile, creator);
          return { creator, similarity };
        })
    );

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.creator);
  }

  async generateRecommendations(
    userPreferenceVector: number[],
    userTags: string[],
    userStyles: string[],
    limit: number = 10
  ): Promise<CreatorRecommendation[]> {
    const allCreators = await this.getAllActiveCreators();
    
    const recommendations = await Promise.all(
      allCreators.map(async (creator) => {
        const relevanceScore = await this.calculateRelevanceScore(
          userPreferenceVector,
          userTags,
          userStyles,
          creator
        );
        
        const reasons = this.generateRecommendationReasons(creator, userTags, userStyles);
        const matchTags = this.findMatchingTags(userTags, creator.contentThemes);
        const matchStyles = this.findMatchingStyles(userStyles, creator.styleSignatures);

        return {
          creator,
          relevanceScore,
          reasons,
          matchTags,
          matchStyles
        };
      })
    );

    return recommendations
      .filter(rec => rec.relevanceScore > 0.1)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  private async getCreatorVideos(userId: string) {
    return this.videoModel.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
  }

  private async getCreatorVideoAnalyses(userId: string) {
    const videos = await this.getCreatorVideos(userId);
    const videoIds = videos.map(v => v.id);
    
    if (videoIds.length === 0) return [];
    
    return this.analysisModel.findAll({
      where: { id: { [Op.in]: videoIds } }
    });
  }

  private async getAllActiveCreators(): Promise<CreatorProfile[]> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const users = await this.userModel.findAll({
      where: {
        [Op.and]: [
          { onboarded: true },
          { createdAt: { [Op.lte]: thirtyDaysAgo } }
        ]
      },
      include: [
        { association: 'followers' },
        { association: 'following' },
        { association: 'videos' }
      ],
      limit: 1000
    });

    return Promise.all(
      users.map(user => this.analyzeCreator(user.id))
    );
  }

  private extractContentThemes(videos: any[], analyses: any[]): string[] {
    const themes = new Set<string>();
    
    videos.forEach(video => {
      if (video.caption) {
        const words = video.caption.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.length > 3 && !this.isCommonWord(word)) {
            themes.add(word);
          }
        });
      }
    });

    analyses.forEach(analysis => {
      analysis.autoHashtags?.forEach((tag: string) => {
        const clean = tag.replace('#', '').toLowerCase();
        if (clean.length > 2) {
          themes.add(clean);
        }
      });
    });

    return Array.from(themes).slice(0, 10);
  }

  private extractStyleSignatures(analyses: any[]): string[] {
    const styles = new Set<string>();
    
    analyses.forEach(analysis => {
      analysis.styleCategories?.forEach((style: string) => {
        if (style.length > 2) {
          styles.add(style.toLowerCase());
        }
      });
    });

    return Array.from(styles);
  }

  private calculateEngagementScore(videos: any[]): number {
    if (videos.length === 0) return 0;
    
    const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0);
    const averageViews = totalViews / videos.length;
    
    return Math.min(averageViews / 1000, 1);
  }

  private calculateContentQuality(videos: any[], analyses: any[]): number {
    if (videos.length === 0) return 0;
    
    const hasAnalysis = analyses.length / videos.length;
    const avgViews = videos.reduce((sum, v) => sum + (v.views || 0), 0) / videos.length;
    const qualityScore = (hasAnalysis * 0.5) + (Math.min(avgViews / 500, 1) * 0.5);
    
    return Math.min(qualityScore, 1);
  }

  private calculateActivityLevel(videos: any[]): number {
    if (videos.length === 0) return 0;
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentVideos = videos.filter(v => new Date(v.createdAt) > thirtyDaysAgo);
    
    return Math.min(recentVideos.length / 10, 1);
  }

  private calculateAverageViews(videos: any[]): number {
    if (videos.length === 0) return 0;
    return videos.reduce((sum, video) => sum + (video.views || 0), 0) / videos.length;
  }

  private getLastActivityDate(videos: any[]): Date {
    if (videos.length === 0) return new Date();
    
    const dates = videos.map(v => v.createdAt).filter(Boolean);
    return new Date(Math.max(...dates.map(d => new Date(d).getTime())));
  }

  private async calculateCreatorSimilarity(creator1: CreatorProfile, creator2: CreatorProfile): Promise<number> {
    const themes1 = creator1.contentThemes.join(' ');
    const themes2 = creator2.contentThemes.join(' ');
    
    if (!themes1 || !themes2) return 0;
    
    const similarities = await this.huggingFaceService.findSimilarContent(themes1, [themes2]);
    return similarities.length > 0 ? similarities[0].score : 0;
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

  private generateRecommendationReasons(creator: CreatorProfile, userTags: string[], userStyles: string[]): string[] {
    const reasons: string[] = [];
    
    if (creator.engagementScore > 0.7) {
      reasons.push('High engagement content');
    }
    
    if (creator.contentQuality > 0.6) {
      reasons.push('Quality content creator');
    }
    
    const matchingTags = this.findMatchingTags(userTags, creator.contentThemes);
    if (matchingTags.length > 0) {
      reasons.push(`Similar interests: ${matchingTags.slice(0, 2).join(', ')}`);
    }
    
    const matchingStyles = this.findMatchingStyles(userStyles, creator.styleSignatures);
    if (matchingStyles.length > 0) {
      reasons.push(`Matching style: ${matchingStyles[0]}`);
    }
    
    if (creator.activityLevel > 0.5) {
      reasons.push('Active creator');
    }
    
    return reasons.slice(0, 3);
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

  private isCommonWord(word: string): boolean {
    const commonWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'oil', 'sit', 'yes', 'yet'];
    return commonWords.includes(word.toLowerCase());
  }
}
