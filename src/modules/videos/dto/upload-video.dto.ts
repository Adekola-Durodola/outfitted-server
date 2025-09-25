import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, ValidateNested, IsUrl, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SoundDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Sound title' })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Sound artist' })
  artist?: string;

  @IsOptional()
  @IsUrl()
  @ApiProperty({ required: false, description: 'Sound URL' })
  url?: string;

  @IsOptional()
  @IsUrl()
  @ApiProperty({ required: false, description: 'Sound embed URL' })
  embedUrl?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Sound duration' })
  duration?: string;

  @IsOptional()
  @IsUrl()
  @ApiProperty({ required: false, description: 'Sound thumbnail URL' })
  thumbnail?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'External sound ID' })
  externalId?: string;
}

export class UploadVideoDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Video URL (if already uploaded to S3)' })
  videoUrl?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'S3 key for the video' })
  s3Key?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Video caption' })
  caption?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Video description' })
  description?: string;

  @IsOptional()
  @ApiProperty({ required: false, description: 'Array of style names' })
  styles?: Array<string>;

  @IsOptional()
  @ApiProperty({ required: false, description: ' string of product links array' })
  productLinks?: Array<string>;

  @IsOptional()
  @Type(() => SoundDto)
  @ApiProperty({ required: false, type: SoundDto })
  sound?: SoundDto;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Sound title (alternative to nested sound object)' })
  soundTitle?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Sound artist (alternative to nested sound object)' })
  soundArtist?: string;

  @IsOptional()
  @IsUrl()
  @ApiProperty({ required: false, description: 'Sound URL (alternative to nested sound object)' })
  soundUrl?: string;

  @IsOptional()
  @IsUrl()
  @ApiProperty({ required: false, description: 'Sound thumbnail URL (alternative to nested sound object)' })
  soundThumbnail?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'External sound ID (alternative to nested sound object)' })
  soundExternalId?: string;

  @IsOptional()
  @IsUrl()
  @ApiProperty({ required: false, description: 'Sound embed URL (alternative to nested sound object)' })
  soundEmbedUrl?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Sound duration (alternative to nested sound object)' })
  soundDuration?: string;
} 