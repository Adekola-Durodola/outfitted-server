import { Controller, Get, Post, Query, Body, BadRequestException } from '@nestjs/common';
import { AiService } from './ai.service';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RecommendationRequestDto, RecommendationResponseDto } from './dto/creator-recommendation.dto';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Throttle({default: { limit: 60, ttl: 60000 }})
  @Get('popular-tags')
  @ApiOperation({ summary: 'Get popular tags from recent content' })
  @ApiResponse({ status: 200, description: 'Popular tags retrieved successfully' })
  async popular() {
    const tags = await this.aiService.popularTags();
    return { tags, count: tags.length, timestamp: new Date().toISOString() };
  }

  @Throttle({default: { limit: 30, ttl: 60000 }})
  @Get('personalized-tags')
  @ApiOperation({ summary: 'Get personalized tags based on user activity' })
  @ApiResponse({ status: 200, description: 'Personalized tags retrieved successfully' })
  async personalized(@Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('userId required');
    const tags = await this.aiService.getPersonalizedTags(userId);
    return { tags, count: tags.length, personalized: true, timestamp: new Date().toISOString() };
  }

  @Throttle({default: { limit: 20, ttl: 60000 }})
  @Post('creator-recommendations')
  @ApiOperation({ summary: 'Get AI-powered creator recommendations' })
  @ApiResponse({ status: 200, description: 'Creator recommendations generated successfully', type: RecommendationResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  async getCreatorRecommendations(@Body() request: RecommendationRequestDto): Promise<RecommendationResponseDto> {
    if (!request.userId) throw new BadRequestException('userId is required');
    return this.aiService.getCreatorRecommendations(request);
  }

  @Throttle({default: { limit: 30, ttl: 60000 }})
  @Get('similar-creators')
  @ApiOperation({ summary: 'Get creators similar to a specific creator' })
  @ApiResponse({ status: 200, description: 'Similar creators retrieved successfully' })
  async getSimilarCreators(@Query('creatorId') creatorId: string, @Query('limit') limit?: number) {
    if (!creatorId) throw new BadRequestException('creatorId is required');
    return this.aiService.getSimilarCreators(creatorId, limit || 10);
  }

  @Throttle({default: { limit: 10, ttl: 60000 }})
  @Post('analyze-content')
  @ApiOperation({ summary: 'Analyze content using AI' })
  @ApiResponse({ status: 200, description: 'Content analyzed successfully' })
  async analyzeContent(@Body() body: { text: string }) {
    if (!body.text) throw new BadRequestException('text is required');
    return this.aiService.analyzeContent(body.text);
  }

  @Throttle({default: { limit: 5, ttl: 60000 }})
  @Post('refresh-recommendations')
  @ApiOperation({ summary: 'Refresh user recommendations' })
  @ApiResponse({ status: 200, description: 'Recommendations refreshed successfully' })
  async refreshRecommendations(@Body() body: { userId: string }) {
    if (!body.userId) throw new BadRequestException('userId is required');
    await this.aiService.refreshUserRecommendations(body.userId);
    return { message: 'Recommendations refreshed successfully' };
  }

  @Throttle({default: { limit: 15, ttl: 60000 }})
  @Post('creator-suggestions')
  @ApiOperation({ summary: 'Get creator suggestions with recent videos' })
  @ApiResponse({ status: 200, description: 'Creator suggestions generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  async getCreatorSuggestions(@Body() request: { userId: string; limit?: number; videosPerCreator?: number; recentOnly?: boolean }) {
    if (!request.userId) throw new BadRequestException('userId is required');
    return this.aiService.getCreatorSuggestions(request);
  }
}
