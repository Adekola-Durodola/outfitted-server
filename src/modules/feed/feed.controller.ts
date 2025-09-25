import { Controller, Get, Query, Req, BadRequestException } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedQueryDto } from './dto/feed-query.dto';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Throttle({default: { limit: 40, ttl: 60000 }})
  @Get()
  async getFeed(@Req() req: Request, @Query() query: Record<string, any>) {
    const userId = (req as any).user?.id || query.userId;
    if (!userId) throw new BadRequestException('userId is required');

    const dto = plainToInstance(FeedQueryDto, query, { enableImplicitConversion: true });
    const errors = validateSync(dto, { whitelist: true });
    if (errors.length) throw new BadRequestException(errors);

    return this.feedService.generateFeed(userId, dto);
  }
}
