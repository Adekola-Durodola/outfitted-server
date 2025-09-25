import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { UserFollow } from './entities/user-follow.entity';
import { UserPreference } from './entities/user-preference.entity';
import { UserOnboardingProgress } from './entities/user-onboarding-progress.entity';
import { S3Service } from 'src/client';
import { MailModule } from '../../client/mail/mail.module';

@Module({
  imports: [
    SequelizeModule.forFeature([User, UserFollow, UserPreference, UserOnboardingProgress]),
    MailModule
  ],
  controllers: [UserController],
  providers: [UserService, S3Service],
  exports: [UserService],
})
export class UserModule {}
