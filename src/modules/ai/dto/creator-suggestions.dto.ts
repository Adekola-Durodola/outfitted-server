import { ApiProperty } from '@nestjs/swagger';

export class VideoSuggestionDto {
  @ApiProperty({ description: 'Video ID' })
  videoId: string;

  @ApiProperty({ description: 'Video title/caption' })
  title: string;

  @ApiProperty({ description: 'Video thumbnail URL' })
  thumbnail: string;

  @ApiProperty({ description: 'Video media URL' })
  mediaUrl: string;

  @ApiProperty({ description: 'Number of views' })
  views: number;

  @ApiProperty({ description: 'Number of likes' })
  likes: number;

  @ApiProperty({ description: 'Video creation date' })
  createdAt: Date;
}

export class CreatorSuggestionDto {
  @ApiProperty({ description: 'Creator user ID' })
  creatorId: string;

  @ApiProperty({ description: 'Creator display name' })
  name: string;

  @ApiProperty({ description: 'Creator username' })
  userName: string;

  @ApiProperty({ description: 'Creator bio/description' })
  bio: string;

  @ApiProperty({ description: 'Creator profile picture URL' })
  profilePic: string;

  @ApiProperty({ description: 'Number of followers' })
  followers: number;

  @ApiProperty({ description: 'Number of following' })
  following: number;

  @ApiProperty({ description: 'Creator recent videos' })
  videos: VideoSuggestionDto[];

  @ApiProperty({ description: 'Relevance score (0-1)' })
  relevanceScore: number;

  @ApiProperty({ description: 'Reasons for suggestion' })
  reasons: string[];
}

export class CreatorSuggestionsRequestDto {
  @ApiProperty({ description: 'User ID to get suggestions for' })
  userId: string;

  @ApiProperty({ description: 'Maximum number of suggestions', required: false, default: 10 })
  limit?: number;

  @ApiProperty({ description: 'Maximum number of videos per creator', required: false, default: 3 })
  videosPerCreator?: number;

  @ApiProperty({ description: 'Include only recent videos (last 30 days)', required: false, default: true })
  recentOnly?: boolean;
}

export class CreatorSuggestionsResponseDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'List of creator suggestions' })
  suggestions: CreatorSuggestionDto[];

  @ApiProperty({ description: 'Total suggestions found' })
  totalSuggestions: number;

  @ApiProperty({ description: 'When suggestions were generated' })
  generatedAt: Date;

  @ApiProperty({ description: 'Algorithm used for suggestions' })
  algorithm: string;
}
