import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { SearchService } from './search.service';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { SearchQueryDto } from './dto/search-query.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Throttle({default: { limit: 100, ttl: 60000 }})
  @Get()
  async search(@Query() query: Record<string, any>) {
    const dto = plainToInstance(SearchQueryDto, query, { enableImplicitConversion: true });
    const errors = validateSync(dto, { whitelist: true });
    if (errors.length) throw new BadRequestException(errors);

    return this.searchService.search(dto);
  }
}
