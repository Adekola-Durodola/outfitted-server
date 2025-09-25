import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { Video } from '../videos/entities/video.entity';

@Module({
  imports: [SequelizeModule.forFeature([Video])],
  controllers: [FeedController],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
