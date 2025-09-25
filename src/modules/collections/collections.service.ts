import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Collection } from './entities/collection.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { Bookmark } from '../bookmarks/entities/bookmark.entity';
import { Video } from '../videos/entities/video.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class CollectionsService {
  constructor(@InjectModel(Collection) private collectionModel: typeof Collection) {}

  async create(dto: CreateCollectionDto) {
    return this.collectionModel.create(dto as any);
  }

  async findAllByUser(userId: string) {
    return this.collectionModel.findAll({
      where: { userId },
      include: [
        {
          model: Bookmark,
          include: [
            {
              model: Video,
              include: [
                {
                  model: User,
                  attributes: ['id', 'userName', 'image'],
                },
                {
                  model: Bookmark,
                },
              ],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: string, userId: string) {
    return this.collectionModel.findOne({
      where: { id, userId },
      include: [
        {
          model: Bookmark,
          include: [
            {
              model: Video,
              include: [{ model: User, attributes: ['id', 'image', 'userName'] }],
            },
          ],
        },
      ],
    });
  }

  async update(id: string, dto: UpdateCollectionDto) {
    await this.collectionModel.update(dto as any, { where: { id } });
    return this.collectionModel.findByPk(id);
  }

  async remove(id: string) {
    return this.collectionModel.destroy({ where: { id } });
  }
}
