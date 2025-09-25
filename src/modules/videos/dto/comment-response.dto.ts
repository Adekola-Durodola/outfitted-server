import { ApiProperty } from '@nestjs/swagger';
import { ReplyResponseDto } from './reply-response.dto';

export class CommentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  videoId: string;

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
  replies: ReplyResponseDto[];

  @ApiProperty()
  likeCount: number;

  @ApiProperty()
  replyCount: number;

  @ApiProperty()
  isLiked: boolean;
} 