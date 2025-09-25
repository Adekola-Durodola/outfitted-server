import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VideoUserDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  userName?: string;

  @ApiPropertyOptional()
  image?: string;

  @ApiPropertyOptional()
  followedBy?: any[];

  @ApiPropertyOptional()
  following?: any[];
}

export class VideoSoundDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  artist: string;

  @ApiProperty()
  url: string;

  @ApiPropertyOptional()
  thumbnail?: string;

  @ApiProperty()
  usageCount: number;
}

export class VideoLikeDto {
  @ApiProperty()
  userId: string;
}

export class VideoCommentDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  replies?: any[];
}

export class VideoBookmarkDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  collectionId: string;

  @ApiProperty()
  userId: string;
}

export class VideoShareDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;
}

export class VideoScrapedDataDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productsData: any;
}

export class VideoResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  url: string;

  @ApiPropertyOptional()
  caption?: string;

  @ApiPropertyOptional()
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
  user: VideoUserDto;

  @ApiPropertyOptional()
  sound?: VideoSoundDto;

  @ApiProperty()
  likes: VideoLikeDto[];

  @ApiProperty()
  comments: VideoCommentDto[];

  @ApiProperty()
  bookmarks: VideoBookmarkDto[];

  @ApiProperty()
  shares: VideoShareDto[];

  @ApiPropertyOptional()
  scrapedData?: VideoScrapedDataDto;

  @ApiProperty()
  isLiked: boolean;

  // Backward compatibility fields
  @ApiPropertyOptional()
  soundId?: string;

  @ApiPropertyOptional()
  soundUrl?: string;

  @ApiPropertyOptional()
  soundTitle?: string;

  @ApiPropertyOptional()
  soundArtist?: string;

  @ApiPropertyOptional()
  soundThumbnail?: string;
} 