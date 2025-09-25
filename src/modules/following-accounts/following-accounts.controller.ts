import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { FollowingAccountsService } from './following-accounts.service';
import { FollowingQueryDto } from './dto/query-following.dto';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Throttle } from '@nestjs/throttler';

@Controller('following-accounts')
export class FollowingAccountsController {
  constructor(private readonly followingAccountsService: FollowingAccountsService) {}

  @Throttle({default: { limit: 30, ttl: 60000 }})
  @Get()
  async getFollowing(@Query() query: Record<string, any>) {
    const dto = plainToInstance(FollowingQueryDto, query);
    const errors = validateSync(dto);
    if (errors.length) throw new BadRequestException(errors);
    return this.followingAccountsService.getFollowing(dto.userId);
  }

}
