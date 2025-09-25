import { ApiProperty } from '@nestjs/swagger';

export class VideoLikeResponseDto {
  @ApiProperty({
    description: 'The ID of the video',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'The URL of the video',
    example: 'https://example.com/video.mp4'
  })
  url: string;

  @ApiProperty({
    description: 'The caption of the video',
    example: 'Amazing video!'
  })
  caption?: string;

  @ApiProperty({
    description: 'The description of the video',
    example: 'This is a great video about...'
  })
  description?: string;

  @ApiProperty({
    description: 'Number of views',
    example: 1000
  })
  views: number;

  @ApiProperty({
    description: 'The ID of the user who posted the video',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  userId: string;

  @ApiProperty({
    description: 'Whether the current user has liked this video',
    example: true
  })
  isLiked: boolean;

  @ApiProperty({
    description: 'Total number of likes on the video',
    example: 50
  })
  likeCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
} 