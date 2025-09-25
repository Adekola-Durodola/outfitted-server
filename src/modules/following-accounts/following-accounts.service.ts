import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserFollow } from '../user/entities/user-follow.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class FollowingAccountsService {
  constructor(@InjectModel(UserFollow) private followModel: typeof UserFollow) {}

  async getFollowing(userId: string) {
    const follows = await this.followModel.findAll({
      where: { followerId: userId },
      include: [{ model: User, as: 'following' }],
    });
    return follows.map((f) => (f as any).following);
  }
}
