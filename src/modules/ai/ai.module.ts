import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { VideoAnalysis } from './entities/video-analysis.entity';
import { UserPreferenceService } from './services/user-preference.service';
import { CreatorAnalysisService } from './services/creator-analysis.service';
import { RecommendationService } from './services/recommendation.service';
import { HuggingFaceService } from './services/huggingface.service';
import { CreatorSuggestionsService } from './services/creator-suggestions.service';
import { User } from '../user/entities/user.entity';
import { Video } from '../videos/entities/video.entity';
import { VideoLike } from '../videos/entities/video-like.entity';
import { Bookmark } from '../bookmarks/entities/bookmark.entity';
import { UserFollow } from '../user/entities/user-follow.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      VideoAnalysis,
      User,
      Video,
      VideoLike,
      Bookmark,
      UserFollow
    ])
  ],
  controllers: [AiController],
  providers: [
    AiService,
    UserPreferenceService,
    CreatorAnalysisService,
    RecommendationService,
    HuggingFaceService,
    CreatorSuggestionsService
  ],
  exports: [AiService],
})
export class AiModule {}
