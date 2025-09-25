import { Module } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Bookmark } from './entities/bookmark.entity';
import { Video } from '../videos/entities/video.entity';
import { Collection } from '../collections/entities/collection.entity';

@Module({
  imports: [SequelizeModule.forFeature([Bookmark, Video, Collection])],
  controllers: [BookmarksController],
  providers: [BookmarksService],
  exports: [BookmarksService],
})
export class BookmarksModule {}
