import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FollowingAccountsService } from './following-accounts.service';
import { FollowingAccountsController } from './following-accounts.controller';
import { UserFollow } from '../user/entities/user-follow.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [SequelizeModule.forFeature([UserFollow, User])],
  controllers: [FollowingAccountsController],
  providers: [FollowingAccountsService],
})
export class FollowingAccountsModule {}
