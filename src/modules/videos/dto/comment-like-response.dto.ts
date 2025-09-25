import { ApiProperty } from '@nestjs/swagger';

export class CommentLikeResponseDto {
  @ApiProperty({
    description: 'Whether the comment is liked by the current user',
    example: true
  })
  isLiked: boolean;

  @ApiProperty({
    description: 'Total number of likes on the comment',
    example: 5
  })
  likeCount: number;

  @ApiProperty({
    description: 'The ID of the comment',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  commentId: string;
} 