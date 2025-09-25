import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Bookmark } from './entities/bookmark.entity';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { Video } from '../videos/entities/video.entity';
import { User } from '../user/entities/user.entity';
import { Collection } from '../collections/entities/collection.entity';

@Injectable()
export class BookmarksService {
  constructor(@InjectModel(Bookmark) private bookmarkModel: typeof Bookmark) {}

  async check(userId: string, videoId: string) {
    const bookmark = await this.bookmarkModel.findOne({
      where: { userId, videoId },
      include: [
        {
          model: Video,
          include: [{ model: User, attributes: ['id', 'userName', 'image'] }],
        },
        Collection,
      ],
    });
    return bookmark;
  }

  async createOrUpdate(dto: CreateBookmarkDto) {
    const { userId, videoId, collectionId } = dto;
    const existing = await this.bookmarkModel.findOne({ where: { userId, videoId } });
    if (existing) {
      if (collectionId) {
        existing.collectionId = collectionId;
        await existing.save();
      }
      return existing;
    }
    return this.bookmarkModel.create(dto as any);
  }

  async remove(dto: CreateBookmarkDto & { collectionId?: string | null }) {
    const { userId, videoId, collectionId } = dto;

    let where: any = { userId, videoId };
    if (collectionId !== undefined) {
      if (collectionId === null) {
        // when null we just use pair composite key
      } else {
        where.collectionId = collectionId;
      }
    }

    const bookmark = await this.bookmarkModel.findOne({ where });
    if (!bookmark) throw new NotFoundException('Bookmark not found');
    await bookmark.destroy();
    return { success: true };
  }
}
