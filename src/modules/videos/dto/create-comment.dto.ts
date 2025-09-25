import { IsString, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @IsString()
  @IsUUID()
  @ApiProperty({
    description: 'The ID of the video',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  videoId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The content of the comment',
    example: 'This is a great video!'
  })
  content: string;
} 