import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Collection } from './entities/collection.entity';
import { Bookmark } from '../bookmarks/entities/bookmark.entity';
import { Video } from '../videos/entities/video.entity';

@Module({
  imports: [SequelizeModule.forFeature([Collection, Bookmark, Video])],
  controllers: [CollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService],
})
export class CollectionsModule {}
