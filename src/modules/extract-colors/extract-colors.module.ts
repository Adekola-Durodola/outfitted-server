import { Module } from '@nestjs/common';
import { ExtractColorsService } from './extract-colors.service';
import { ExtractColorsController } from './extract-colors.controller';

@Module({
  controllers: [ExtractColorsController],
  providers: [ExtractColorsService],
})
export class ExtractColorsModule {}
