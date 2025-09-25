import { ApiProperty } from '@nestjs/swagger';

export class ReplyLikeResponseDto {
  @ApiProperty({
    description: 'Whether the reply is liked by the current user',
    example: true
  })
  isLiked: boolean;

  @ApiProperty({
    description: 'Total number of likes on the reply',
    example: 3
  })
  likeCount: number;

  @ApiProperty({
    description: 'The ID of the reply',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  replyId: string;
} 