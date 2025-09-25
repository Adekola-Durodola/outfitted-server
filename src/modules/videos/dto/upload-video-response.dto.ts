import { ApiProperty } from '@nestjs/swagger';

export class VideoInfoDto {
  @ApiProperty({ description: 'Video caption' })
  caption: string;

  @ApiProperty({ description: 'Video description' })
  description: string;

  @ApiProperty({ description: 'Video URL' })
  videoUrl: string;
}

export class ScrapedDataDto {
  @ApiProperty({ description: 'Scraped data ID' })
  id: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Products data array' })
  productsData: any[];
}

export class VideoStyleDto {
  @ApiProperty({ description: 'Style ID' })
  id: string;

  @ApiProperty({ description: 'Style name' })
  name: string;

  @ApiProperty({ description: 'Style ID slug' })
  styleId: string;

  @ApiProperty({ description: 'Video ID' })
  videoId: string;
}

export class SoundDto {
  @ApiProperty({ description: 'Sound ID' })
  id: string;

  @ApiProperty({ description: 'Sound title' })
  title: string;

  @ApiProperty({ description: 'Sound artist' })
  artist: string;

  @ApiProperty({ description: 'Sound URL', required: false })
  url?: string;

  @ApiProperty({ description: 'Sound thumbnail', required: false })
  thumbnail?: string;

  @ApiProperty({ description: 'External ID', required: false })
  externalId?: string;

  @ApiProperty({ description: 'Embed URL', required: false })
  embedUrl?: string;

  @ApiProperty({ description: 'Duration', required: false })
  duration?: string;

  @ApiProperty({ description: 'Source type' })
  sourceType: string;

  @ApiProperty({ description: 'Usage count' })
  usageCount: number;
}

export class UserDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Username', required: false })
  userName?: string;

  @ApiProperty({ description: 'User name', required: false })
  name?: string;

  @ApiProperty({ description: 'User image', required: false })
  image?: string;
}

export class UploadedVideoDto {
  @ApiProperty({ description: 'Video ID' })
  id: string;

  @ApiProperty({ description: 'Video URL' })
  url: string;

  @ApiProperty({ description: 'Video caption', required: false })
  caption?: string;

  @ApiProperty({ description: 'Video description', required: false })
  description?: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Sound ID', required: false })
  soundId?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Update timestamp' })
  updatedAt: Date;

  @ApiProperty({ type: [ScrapedDataDto], description: 'Scraped data' })
  scrapedData: ScrapedDataDto[];

  @ApiProperty({ type: [VideoStyleDto], description: 'Video styles' })
  styles: VideoStyleDto[];

  @ApiProperty({ type: SoundDto, description: 'Sound information', required: false })
  sound?: SoundDto;

  @ApiProperty({ type: UserDto, description: 'User information' })
  user: UserDto;
}

export class UploadVideoResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ type: VideoInfoDto, description: 'Video information' })
  videoInfo: VideoInfoDto;

  @ApiProperty({ type: UploadedVideoDto, description: 'Uploaded video data' })
  video: UploadedVideoDto;

  @ApiProperty({ 
    description: 'Scraping status',
    enum: ['completed', 'failed', 'not_requested']
  })
  scrapingStatus: 'completed' | 'failed' | 'not_requested';
} 