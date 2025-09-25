import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { GoogleShoppingService } from './google-shopping.service';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { GoogleShoppingQueryDto } from './dto/google-shopping-query.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('google-shopping')
export class GoogleShoppingController {
  constructor(private readonly googleShoppingService: GoogleShoppingService) {}

  @Throttle({default: { limit: 30, ttl: 60000 }})
  @Get()
  async search(@Query() query: Record<string, any>): Promise<any> {
    const dto = plainToInstance(GoogleShoppingQueryDto, query, { enableImplicitConversion: true });
    const errs = validateSync(dto);
    if (errs.length) throw new BadRequestException(errs);

    const products = await this.googleShoppingService.search(dto);
    return { products, total: products.length, query: dto.query };
  }
}
