import { ApiProperty } from '@nestjs/swagger';

export class CreatorProfileDto {
  @ApiProperty({ description: 'Creator user ID' })
  userId: string;

  @ApiProperty({ description: 'Creator username' })
  userName: string;

  @ApiProperty({ description: 'Creator display name' })
  name: string;

  @ApiProperty({ description: 'Creator profile image URL', required: false })
  image?: string;

  @ApiProperty({ description: 'Content themes this creator focuses on' })
  contentThemes: string[];

  @ApiProperty({ description: 'Style signatures of this creator' })
  styleSignatures: string[];

  @ApiProperty({ description: 'Engagement score (0-1)' })
  engagementScore: number;

  @ApiProperty({ description: 'Content quality score (0-1)' })
  contentQuality: number;

  @ApiProperty({ description: 'Activity level score (0-1)' })
  activityLevel: number;

  @ApiProperty({ description: 'Number of followers' })
  followerCount: number;

  @ApiProperty({ description: 'Number of following' })
  followingCount: number;

  @ApiProperty({ description: 'Total video count' })
  videoCount: number;

  @ApiProperty({ description: 'Average views per video' })
  averageViews: number;

  @ApiProperty({ description: 'Last activity date' })
  lastActiveAt: Date;
}

export class CreatorRecommendationDto {
  @ApiProperty({ description: 'Creator profile information' })
  creator: CreatorProfileDto;

  @ApiProperty({ description: 'Relevance score (0-1)' })
  relevanceScore: number;

  @ApiProperty({ description: 'Reasons for recommendation' })
  reasons: string[];

  @ApiProperty({ description: 'Matching tags with user preferences' })
  matchTags: string[];

  @ApiProperty({ description: 'Matching styles with user preferences' })
  matchStyles: string[];
}

export class RecommendationRequestDto {
  @ApiProperty({ description: 'User ID to generate recommendations for' })
  userId: string;

  @ApiProperty({ description: 'Maximum number of recommendations', required: false, default: 10 })
  limit?: number;

  @ApiProperty({ description: 'Include detailed reasons for recommendations', required: false, default: true })
  includeReasons?: boolean;

  @ApiProperty({ description: 'Apply diversity boost to recommendations', required: false, default: true })
  diversityBoost?: boolean;
}

export class RecommendationResponseDto {
  @ApiProperty({ description: 'List of creator recommendations' })
  recommendations: CreatorRecommendationDto[];

  @ApiProperty({ description: 'User preference profile used for recommendations' })
  userProfile: {
    userId: string;
    preferredTags: string[];
    preferredStyles: string[];
    preferredCreators: string[];
    activityScore: number;
    diversityScore: number;
    lastActiveAt: Date;
  };

  @ApiProperty({ description: 'When recommendations were generated' })
  generatedAt: Date;

  @ApiProperty({ description: 'Total number of candidates considered' })
  totalCandidates: number;

  @ApiProperty({ description: 'Algorithm used for recommendations' })
  algorithm: string;
}
