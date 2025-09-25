import { Module } from '@nestjs/common';
import { SuggestedUsersService } from './suggested-users.service';
import { SuggestedUsersController } from './suggested-users.controller';

@Module({
  controllers: [SuggestedUsersController],
  providers: [SuggestedUsersService],
})
export class SuggestedUsersModule {}
