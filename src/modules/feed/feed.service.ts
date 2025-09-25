import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Video } from '../videos/entities/video.entity';
import { FeedQueryDto, FeedType } from './dto/feed-query.dto';

@Injectable()
export class FeedService {
  constructor(@InjectModel(Video) private videoModel: typeof Video) {}

  async generateFeed(userId: string, query: FeedQueryDto) {
    const { feedType, page, limit } = query;
    const offset = (page - 1) * limit;

    let order: any[] = [['createdAt', 'DESC']];
    if (feedType === FeedType.TRENDING) {
      order = [['views', 'DESC']];
    }

    // For simplicity we fetch without personalization for now
    const { rows: videos, count } = await this.videoModel.findAndCountAll({
      include: [{ all: true }],
      order,
      limit,
      offset,
    });

    return {
      videos,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
        hasMore: offset + videos.length < count,
      },
      metadata: {
        feedType,
        generatedAt: new Date().toISOString(),
        algorithm: 'simple',
        userId,
      },
    };
  }
}
