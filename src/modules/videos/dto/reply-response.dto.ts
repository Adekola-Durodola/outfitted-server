import { ApiProperty } from '@nestjs/swagger';

export class ReplyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  commentId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  user: {
    id: string;
    userName?: string;
    image?: string;
  };

  @ApiProperty()
  likeCount: number;

  @ApiProperty()
  isLiked: boolean;
} 