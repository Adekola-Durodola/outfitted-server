import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { User } from '../user/entities/user.entity';
import { Video } from '../videos/entities/video.entity';

@Module({
  imports: [SequelizeModule.forFeature([User, Video])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
