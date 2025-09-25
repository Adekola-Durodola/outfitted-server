import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum FeedType {
  HOME = 'home',
  EXPLORE = 'explore',
  TRENDING = 'trending',
  FOLLOWING = 'following',
}

export class FeedQueryDto {
  @IsOptional()
  @IsEnum(FeedType)
  feedType: FeedType = FeedType.HOME;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 50;

  @IsOptional()
  refresh?: boolean;
} 