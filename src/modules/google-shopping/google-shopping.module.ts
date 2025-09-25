import { Module } from '@nestjs/common';
import { GoogleShoppingService } from './google-shopping.service';
import { GoogleShoppingController } from './google-shopping.controller';

@Module({
  controllers: [GoogleShoppingController],
  providers: [GoogleShoppingService],
})
export class GoogleShoppingModule {}
