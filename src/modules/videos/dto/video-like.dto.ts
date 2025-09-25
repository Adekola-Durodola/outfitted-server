import { IsString, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VideoLikeDto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The ID of the user liking the video',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  userId: string;

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The ID of the video to like',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  postId: string;
} 