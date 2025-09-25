import { IsString, IsUUID, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessVideoDto {
  @IsString()
  @IsUUID()
  @ApiProperty({
    description: 'The ID of the video to process',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  videoId: string;

  @IsString()
  @ApiProperty({
    description: 'The URL of the video to process',
    example: 'https://bucket-name.s3.region.amazonaws.com/videos/video.mp4'
  })
  videoUrl: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Whether to generate HLS stream',
    default: true,
    required: false
  })
  generateHLS?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Whether to generate thumbnail',
    default: true,
    required: false
  })
  generateThumbnail?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  @ApiProperty({
    description: 'Time in seconds to capture thumbnail from',
    default: 2,
    minimum: 0,
    maximum: 300,
    required: false
  })
  thumbnailTime?: number;
} 