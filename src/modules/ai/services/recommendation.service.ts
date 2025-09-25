import { Injectable } from '@nestjs/common';
import { UserPreferenceService, UserPreferenceProfile } from './user-preference.service';
import { CreatorAnalysisService, CreatorRecommendation } from './creator-analysis.service';
import { HuggingFaceService } from './huggingface.service';

export interface RecommendationRequest {
  userId: string;
  limit?: number;
  includeReasons?: boolean;
  diversityBoost?: boolean;
}

export interface RecommendationResponse {
  recommendations: CreatorRecommendation[];
  userProfile: UserPreferenceProfile;
  generatedAt: Date;
  totalCandidates: number;
  algorithm: string;
}

@Injectable()
export class RecommendationService {
  constructor(
    private userPreferenceService: UserPreferenceService,
    private creatorAnalysisService: CreatorAnalysisService,
    private huggingFaceService: HuggingFaceService,
  ) {}

  async generateCreatorRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    const { userId, limit = 10, includeReasons = true, diversityBoost = true } = request;

    const userProfile = await this.userPreferenceService.analyzeUserPreferences(userId);
    
    if (userProfile.activityScore < 0.1) {
      return this.getFallbackRecommendations(userProfile, limit);
    }

    const userContent = await this.getUserContentForAnalysis(userId);
    const userPreferenceVector = await this.huggingFaceService.generateUserPreferenceVector(userContent);
    
    const recommendations = await this.creatorAnalysisService.generateRecommendations(
      userPreferenceVector,
      userProfile.preferredTags,
      userProfile.preferredStyles,
      limit * 2
    );

    let finalRecommendations = recommendations;

    if (diversityBoost) {
      finalRecommendations = this.applyDiversityBoost(recommendations, userProfile);
    }

    if (includeReasons) {
      finalRecommendations = await this.enhanceRecommendationsWithReasons(finalRecommendations, userProfile);
    }

    return {
      recommendations: finalRecommendations.slice(0, limit),
      userProfile,
      generatedAt: new Date(),
      totalCandidates: recommendations.length,
      algorithm: 'hybrid-ai-recommendation'
    };
  }

  async getSimilarCreators(creatorId: string, limit: number = 10): Promise<CreatorRecommendation[]> {
    const similarCreators = await this.creatorAnalysisService.findSimilarCreators(creatorId, limit);
    
    return similarCreators.map(creator => ({
      creator,
      relevanceScore: 0.8,
      reasons: ['Similar content style'],
      matchTags: [],
      matchStyles: []
    }));
  }

  async refreshUserRecommendations(userId: string): Promise<void> {
    await this.userPreferenceService.analyzeUserPreferences(userId);
  }

  private async getUserContentForAnalysis(userId: string): Promise<string[]> {
    const userProfile = await this.userPreferenceService.analyzeUserPreferences(userId);
    
    const content: string[] = [];
    
    userProfile.preferredTags.forEach(tag => content.push(tag));
    userProfile.preferredStyles.forEach(style => content.push(style));
    
    return content;
  }

  private applyDiversityBoost(recommendations: CreatorRecommendation[], userProfile: UserPreferenceProfile): CreatorRecommendation[] {
    const diversified: CreatorRecommendation[] = [];
    const usedStyles = new Set<string>();
    const usedThemes = new Set<string>();

    for (const rec of recommendations) {
      const styleOverlap = rec.creator.styleSignatures.some(style => usedStyles.has(style));
      const themeOverlap = rec.creator.contentThemes.some(theme => usedThemes.has(theme));
      
      if (!styleOverlap || !themeOverlap || diversified.length < 5) {
        diversified.push(rec);
        rec.creator.styleSignatures.forEach(style => usedStyles.add(style));
        rec.creator.contentThemes.forEach(theme => usedThemes.add(theme));
      }
    }

    const remaining = recommendations.filter(rec => !diversified.includes(rec));
    return [...diversified, ...remaining];
  }

  private async enhanceRecommendationsWithReasons(
    recommendations: CreatorRecommendation[],
    userProfile: UserPreferenceProfile
  ): Promise<CreatorRecommendation[]> {
    return recommendations.map(rec => {
      const reasons = this.generateEnhancedReasons(rec, userProfile);
      return { ...rec, reasons };
    });
  }

  private generateEnhancedReasons(rec: CreatorRecommendation, userProfile: UserPreferenceProfile): string[] {
    const reasons: string[] = [];

    if (rec.relevanceScore > 0.8) {
      reasons.push('Highly relevant to your interests');
    } else if (rec.relevanceScore > 0.6) {
      reasons.push('Good match for your preferences');
    }

    if (rec.creator.engagementScore > 0.7) {
      reasons.push('Popular creator with high engagement');
    }

    if (rec.creator.contentQuality > 0.6) {
      reasons.push('Creates high-quality content');
    }

    if (rec.creator.activityLevel > 0.5) {
      reasons.push('Regularly posts new content');
    }

    if (rec.matchTags.length > 0) {
      reasons.push(`Shares your interest in: ${rec.matchTags.slice(0, 2).join(', ')}`);
    }

    if (rec.matchStyles.length > 0) {
      reasons.push(`Similar style: ${rec.matchStyles[0]}`);
    }

    if (rec.creator.followerCount > 1000) {
      reasons.push('Well-established creator');
    }

    return reasons.slice(0, 3);
  }

  private getFallbackRecommendations(userProfile: UserPreferenceProfile, limit: number): RecommendationResponse {
    return {
      recommendations: [],
      userProfile,
      generatedAt: new Date(),
      totalCandidates: 0,
      algorithm: 'fallback-no-activity'
    };
  }
}
