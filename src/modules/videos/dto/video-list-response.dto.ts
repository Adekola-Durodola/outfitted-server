import { ApiProperty } from '@nestjs/swagger';

export class VideoListResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  caption?: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  views: number;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  hlsUrl?: string;

  @ApiProperty()
  thumbnailUrl?: string;

  @ApiProperty({
    type: 'object',
    properties: {
      id: { type: 'string' },
      userName: { type: 'string' },
      image: { type: 'string' }
    }
  })
  user: {
    id: string;
    userName?: string;
    image?: string;
  };

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        userId: { type: 'string' }
      }
    }
  })
  likes: Array<{ userId: string }>;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object'
    }
  })
  comments: any[];

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object'
    }
  })
  bookmarks: any[];

  @ApiProperty()
  isLiked: boolean;

  // Backward compatibility fields
  @ApiProperty({ required: false })
  soundId?: string;

  @ApiProperty({ required: false })
  soundUrl?: string;

  @ApiProperty({ required: false })
  soundTitle?: string;

  @ApiProperty({ required: false })
  soundArtist?: string;

  @ApiProperty({ required: false })
  soundThumbnail?: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string' },
    default: []
  })
  shares: string[];

  @ApiProperty({ required: false })
  scrapedData?: any;
} 