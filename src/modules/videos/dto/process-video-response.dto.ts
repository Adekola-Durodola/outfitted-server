import { ApiProperty } from '@nestjs/swagger';

export class ProcessVideoResponseDto {
  @ApiProperty({
    description: 'Whether the processing was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'The ID of the processed video',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  videoId: string;

  @ApiProperty({
    description: 'HLS playlist URL',
    example: 'https://bucket-name.s3.region.amazonaws.com/videos/hls/video-id/playlist.m3u8',
    required: false
  })
  hlsUrl?: string;

  @ApiProperty({
    description: 'Thumbnail URL',
    example: 'https://bucket-name.s3.region.amazonaws.com/videos/thumbnails/video-id/thumbnail.jpg',
    required: false
  })
  thumbnailUrl?: string;

  @ApiProperty({
    description: 'Array of HLS segment URLs',
    type: [String],
    example: [
      'https://bucket-name.s3.region.amazonaws.com/videos/hls/video-id/segment0.ts',
      'https://bucket-name.s3.region.amazonaws.com/videos/hls/video-id/segment1.ts'
    ],
    required: false
  })
  segments?: string[];

  @ApiProperty({
    description: 'Error message if processing failed',
    example: 'Thumbnail generation failed',
    required: false
  })
  error?: string;
} 