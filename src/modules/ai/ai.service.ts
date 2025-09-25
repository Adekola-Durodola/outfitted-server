import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { VideoAnalysis } from './entities/video-analysis.entity';
import { UserPreferenceService } from './services/user-preference.service';
import { CreatorAnalysisService } from './services/creator-analysis.service';
import { RecommendationService } from './services/recommendation.service';
import { HuggingFaceService } from './services/huggingface.service';
import { RecommendationRequest, RecommendationResponse } from './services/recommendation.service';
import { CreatorSuggestionsService, CreatorSuggestionsRequest, CreatorSuggestionsResponse } from './services/creator-suggestions.service';
import { Op } from 'sequelize';

@Injectable()
export class AiService {
  constructor(
    @InjectModel(VideoAnalysis) private analysisModel: typeof VideoAnalysis,
    private userPreferenceService: UserPreferenceService,
    private creatorAnalysisService: CreatorAnalysisService,
    private recommendationService: RecommendationService,
    private huggingFaceService: HuggingFaceService,
    private creatorSuggestionsService: CreatorSuggestionsService,
  ) {}

  async popularTags() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const analyses = await this.analysisModel.findAll({
      where: { createdAt: { [Op.gte]: sevenDaysAgo } },
      attributes: ['autoHashtags', 'styleCategories'],
      limit: 1000,
    });

    const tagFrequency = new Map<string, number>();
    const styleFrequency = new Map<string, number>();

    analyses.forEach((a) => {
      a.autoHashtags?.forEach((tag) => {
        const clean = tag.replace('#', '').toLowerCase();
        if (clean.length > 2)
          tagFrequency.set(clean, (tagFrequency.get(clean) || 0) + 1);
      });
      a.styleCategories?.forEach((s) => {
        if (s.length > 2)
          styleFrequency.set(s.toLowerCase(), (styleFrequency.get(s.toLowerCase()) || 0) + 1);
      });
    });

    const topHashtags = Array.from(tagFrequency.entries()).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([t])=>t);
    const topStyles = Array.from(styleFrequency.entries()).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([s])=>s);
    const combined = Array.from(new Set([...topHashtags, ...topStyles])).slice(0,12);
    const fallback = ['streetstyle','ootd','fashion','style','vintage','minimal','casual','formal'];
    return combined.length ? combined : fallback;
  }

  async getPersonalizedTags(userId: string): Promise<string[]> {
    const userProfile = await this.userPreferenceService.analyzeUserPreferences(userId);
    return userProfile.preferredTags.slice(0, 12);
  }

  async getCreatorRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    return this.recommendationService.generateCreatorRecommendations(request);
  }

  async getSimilarCreators(creatorId: string, limit: number = 10) {
    return this.recommendationService.getSimilarCreators(creatorId, limit);
  }

  async analyzeContent(text: string) {
    return this.huggingFaceService.analyzeContent(text);
  }

  async refreshUserRecommendations(userId: string): Promise<void> {
    return this.recommendationService.refreshUserRecommendations(userId);
  }

  async getCreatorSuggestions(request: CreatorSuggestionsRequest): Promise<CreatorSuggestionsResponse> {
    return this.creatorSuggestionsService.getCreatorSuggestions(request);
  }
}
