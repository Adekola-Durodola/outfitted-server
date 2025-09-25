import { IsString, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddSoundDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Sound title' })
  soundTitle?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Sound artist' })
  soundArtist?: string;

  @IsOptional()
  @IsUrl()
  @ApiProperty({ required: false, description: 'Sound URL' })
  soundUrl?: string;

  @IsOptional()
  @IsUrl()
  @ApiProperty({ required: false, description: 'Sound embed URL' })
  embedUrl?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Sound duration' })
  soundDuration?: string;

  @IsOptional()
  @IsUrl()
  @ApiProperty({ required: false, description: 'Sound thumbnail URL' })
  soundThumbnail?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'External sound ID' })
  externalId?: string;
} 