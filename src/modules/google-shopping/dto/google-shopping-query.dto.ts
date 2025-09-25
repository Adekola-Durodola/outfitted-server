import { IsString, IsOptional, IsNumberString, IsEnum } from 'class-validator';

export enum GoogleSort {
  PRICE = 'price',
  RELEVANCE = 'relevance',
}

export class GoogleShoppingQueryDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsNumberString()
  maxPrice?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(GoogleSort)
  sort: GoogleSort = GoogleSort.PRICE;
} 