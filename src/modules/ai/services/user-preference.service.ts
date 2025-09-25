import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Video } from '../../videos/entities/video.entity';
import { VideoLike } from '../../videos/entities/video-like.entity';
import { Bookmark } from '../../bookmarks/entities/bookmark.entity';
import { UserFollow } from '../../user/entities/user-follow.entity';
import { VideoAnalysis } from '../entities/video-analysis.entity';
import { Op } from 'sequelize';

export interface UserPreferenceProfile {
  userId: string;
  preferredTags: string[];
  preferredStyles: string[];
  preferredCreators: string[];
  activityScore: number;
  diversityScore: number;
  lastActiveAt: Date;
}

@Injectable()
export class UserPreferenceService {
  constructor(
    @InjectModel(Video) private videoModel: typeof Video,
    @InjectModel(VideoLike) private videoLikeModel: typeof VideoLike,
    @InjectModel(Bookmark) private bookmarkModel: typeof Bookmark,
    @InjectModel(UserFollow) private userFollowModel: typeof UserFollow,
    @InjectModel(VideoAnalysis) private analysisModel: typeof VideoAnalysis,
  ) {}

  async analyzeUserPreferences(userId: string): Promise<UserPreferenceProfile> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const [likedVideos, bookmarkedVideos, followingList] = await Promise.all([
      this.getLikedVideos(userId, thirtyDaysAgo),
      this.getBookmarkedVideos(userId, thirtyDaysAgo),
      this.getFollowingList(userId)
    ]);

    const allInteractedVideos = [...likedVideos, ...bookmarkedVideos];
    const uniqueVideoIds = [...new Set(allInteractedVideos.map(v => v.id))];
    
    const videoAnalyses = await this.getVideoAnalyses(uniqueVideoIds);
    
    const preferences = this.extractPreferences(videoAnalyses, allInteractedVideos);
    const activityScore = this.calculateActivityScore(likedVideos, bookmarkedVideos, followingList);
    const diversityScore = this.calculateDiversityScore(preferences.tags, preferences.styles);
    
    return {
      userId,
      preferredTags: preferences.tags,
      preferredStyles: preferences.styles,
      preferredCreators: preferences.creators,
      activityScore,
      diversityScore,
      lastActiveAt: this.getLastActivityDate(allInteractedVideos)
    };
  }

  private async getLikedVideos(userId: string, since: Date) {
    const likes = await this.videoLikeModel.findAll({
      where: { userId },
      include: [{
        model: this.videoModel,
        where: { createdAt: { [Op.gte]: since } }
      }],
      order: [['createdAt', 'DESC']]
    });
    return likes.map(like => like.video).filter(Boolean);
  }

  private async getBookmarkedVideos(userId: string, since: Date) {
    const bookmarks = await this.bookmarkModel.findAll({
      where: { userId },
      include: [{
        model: this.videoModel,
        where: { createdAt: { [Op.gte]: since } }
      }],
      order: [['createdAt', 'DESC']]
    });
    return bookmarks.map(bookmark => bookmark.video).filter(Boolean);
  }

  private async getFollowingList(userId: string) {
    const follows = await this.userFollowModel.findAll({
      where: { followerId: userId },
      include: ['following']
    });
    return follows.map(follow => follow.following).filter(Boolean);
  }

  private async getVideoAnalyses(videoIds: string[]) {
    if (videoIds.length === 0) return [];
    
    return this.analysisModel.findAll({
      where: { id: { [Op.in]: videoIds } }
    });
  }

  private extractPreferences(analyses: any[], videos: any[]) {
    const tagFrequency = new Map<string, number>();
    const styleFrequency = new Map<string, number>();
    const creatorFrequency = new Map<string, number>();

    analyses.forEach(analysis => {
      analysis.autoHashtags?.forEach((tag: string) => {
        const clean = tag.replace('#', '').toLowerCase();
        if (clean.length > 2) {
          tagFrequency.set(clean, (tagFrequency.get(clean) || 0) + 1);
        }
      });

      analysis.styleCategories?.forEach((style: string) => {
        if (style.length > 2) {
          styleFrequency.set(style.toLowerCase(), (styleFrequency.get(style) || 0) + 1);
        }
      });
    });

    videos.forEach(video => {
      if (video.userId) {
        creatorFrequency.set(video.userId, (creatorFrequency.get(video.userId) || 0) + 1);
      }
    });

    const topTags = Array.from(tagFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);

    const topStyles = Array.from(styleFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([style]) => style);

    const topCreators = Array.from(creatorFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([creatorId]) => creatorId);

    return {
      tags: topTags,
      styles: topStyles,
      creators: topCreators
    };
  }

  private calculateActivityScore(likedVideos: any[], bookmarkedVideos: any[], followingList: any[]): number {
    const likesWeight = 1;
    const bookmarksWeight = 2;
    const followsWeight = 3;
    
    const totalScore = (likedVideos.length * likesWeight) + 
                     (bookmarkedVideos.length * bookmarksWeight) + 
                     (followingList.length * followsWeight);
    
    return Math.min(totalScore / 100, 1);
  }

  private calculateDiversityScore(tags: string[], styles: string[]): number {
    const uniqueTags = new Set(tags).size;
    const uniqueStyles = new Set(styles).size;
    
    const maxPossible = 15;
    const actual = uniqueTags + uniqueStyles;
    
    return Math.min(actual / maxPossible, 1);
  }

  private getLastActivityDate(videos: any[]): Date {
    if (videos.length === 0) return new Date();
    
    const dates = videos.map(v => v.createdAt).filter(Boolean);
    return new Date(Math.max(...dates.map(d => new Date(d).getTime())));
  }
}
