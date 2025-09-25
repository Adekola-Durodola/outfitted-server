import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { Video } from './entities/video.entity';
import { Comment } from './entities/comment.entity';
import { CommentLike } from './entities/comment-like.entity';
import { CommentReply } from './entities/comment-reply.entity';
import { CommentReplyLike } from './entities/comment-reply-like.entity';
import { VideoLike } from './entities/video-like.entity';
import { Notification } from './entities/notification.entity';
import { User } from '../user/entities/user.entity';
import { Bookmark } from '../bookmarks/entities/bookmark.entity';
import { Sound } from './entities/sound.entity';
import { VideoStyle } from './entities/video-style.entity';
import { ScrapedData } from './entities/scraped-data.entity';
import { ConfigModule } from '@nestjs/config';
import { S3Module } from '../../client/s3/s3.module';
import { S3Service } from 'src/client';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Video,
      Comment,
      CommentLike,
      CommentReply,
      CommentReplyLike,
      VideoLike,
      Notification,
      User,
      Bookmark,
      Sound,
      VideoStyle,
      ScrapedData,
    ]),
    ConfigModule,
  ],
  controllers: [VideosController],
  providers: [VideosService, S3Service],
  exports: [VideosService],
})
export class VideosModule {}
