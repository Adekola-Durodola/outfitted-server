import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../user/entities/user.entity';
import { Video } from '../videos/entities/video.entity';
import { SearchQueryDto, SearchType } from './dto/search-query.dto';
import { Op } from 'sequelize';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Video) private videoModel: typeof Video,
  ) {}

  async search(query: SearchQueryDto) {
    const { q, type, limit, offset } = query;
    const like = q ? { [Op.iLike]: `%${q}%` } : undefined;

    let users: any[] = [];
    let videos: any[] = [];
    let totalUsers = 0;
    let totalVideos = 0;

    if (type === SearchType.USERS || type === SearchType.ALL) {
      const where: any = q
        ? {
            [Op.or]: [
              { userName: like },
              { name: like },
              { bio: like },
            ],
          }
        : undefined;
      const { rows, count } = await this.userModel.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });
      users = rows;
      totalUsers = count;
    }

    if (type === SearchType.VIDEOS || type === SearchType.ALL) {
      const where: any = q
        ? {
            [Op.or]: [
              { caption: like },
              { description: like },
            ],
          }
        : undefined;
      const { rows, count } = await this.videoModel.findAndCountAll({
        where,
        include: [{ all: true }],
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });
      videos = rows;
      totalVideos = count;
    }

    return {
      users,
      videos,
      totalUsers,
      totalVideos,
      query: q,
      type,
    };
  }
}
