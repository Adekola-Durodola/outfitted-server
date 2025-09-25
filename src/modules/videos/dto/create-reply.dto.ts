import { IsString, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReplyDto {
  @IsString()
  @IsUUID()
  @ApiProperty({
    description: 'The ID of the parent comment',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  commentId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The content of the reply',
    example: 'This is a reply to the comment'
  })
  content: string;
} 