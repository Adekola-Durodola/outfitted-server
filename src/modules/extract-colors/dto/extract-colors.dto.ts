import { IsUrl, IsOptional, IsInt, Min, Max, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum ColorFormat {
  HEX = 'hex',
  RGB = 'rgb',
  HSL = 'hsl',
}

export class ExtractColorsDto {
  @IsUrl()
  imageUrl: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  maxColors: number = 10;

  @IsOptional()
  @IsEnum(ColorFormat)
  format: ColorFormat = ColorFormat.HEX;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includePercentages: boolean = true;
} 