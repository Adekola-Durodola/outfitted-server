import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ExtractColorsService } from './extract-colors.service';
import { ExtractColorsDto } from './dto/extract-colors.dto';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Throttle } from '@nestjs/throttler';

@Controller('extract-colors')
export class ExtractColorsController {
  constructor(private readonly extractColorsService: ExtractColorsService) {}

  @Throttle({default: { limit: 20, ttl: 60000 }})
  @Post()
  async extract(@Body() body: any): Promise<any> {
    const dto = plainToInstance(ExtractColorsDto, body, { enableImplicitConversion: true });
    const errors = validateSync(dto);
    if (errors.length) throw new BadRequestException(errors);

    return this.extractColorsService.extract(dto);
  }
}
