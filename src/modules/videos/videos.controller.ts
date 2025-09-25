import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Req, UseGuards, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideosService } from './videos.service';
import { S3Service } from '../../client/s3/s3.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommentLikeDto } from './dto/comment-like.dto';
import { ReplyLikeDto } from './dto/reply-like.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { VideoLikeDto } from './dto/video-like.dto';
import { ProcessVideoDto } from './dto/process-video.dto';
import { ProcessVideoResponseDto } from './dto/process-video-response.dto';
import { UploadVideoDto } from './dto/upload-video.dto';
import { UploadVideoResponseDto } from './dto/upload-video-response.dto';
import { VideoListResponseDto } from './dto/video-list-response.dto';
import { CommentLikeResponseDto } from './dto/comment-like-response.dto';
import { ReplyLikeResponseDto } from './dto/reply-like-response.dto';
import { VideoLikeResponseDto } from './dto/video-like-response.dto';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes } from '@nestjs/swagger';

type JwtRequest = Request & { user?: { userId: string } };

@ApiTags('videos')
@Controller('videos')
export class VideosController {
  constructor(
    private readonly videosService: VideosService,
    private readonly s3Service: S3Service
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all videos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Videos retrieved successfully',
    type: [VideoListResponseDto]
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAllVideos(@Req() req: JwtRequest): Promise<VideoListResponseDto[]> {
    const currentUserId = req.user?.userId;
    return this.videosService.findAll(currentUserId);
  }

  @Get(':videoId')
  @ApiOperation({ summary: 'Get a specific video' })
  @ApiParam({ name: 'videoId', description: 'Video ID' })
  @ApiResponse({ status: 200, description: 'Video retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async getVideo(@Param('videoId') videoId: string, @Req() req: JwtRequest) {
    const currentUserId = req.user?.userId;
    return this.videosService.findOne(videoId, currentUserId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a video' })
  @ApiParam({ name: 'id', description: 'Video ID' })
  @ApiResponse({ status: 200, description: 'Video updated successfully' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateVideo(@Param('id') id: string, @Body() updateVideoDto: UpdateVideoDto, @Req() req: JwtRequest) {
    const currentUserId = req.user?.userId;
    return this.videosService.update(id, updateVideoDto, currentUserId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a video' })
  @ApiParam({ name: 'id', description: 'Video ID' })
  @ApiResponse({ status: 200, description: 'Video deleted successfully' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteVideo(@Param('id') id: string, @Req() req: JwtRequest) {
    const currentUserId = req.user?.userId;
    return this.videosService.remove(id, currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('comment-like')
  @ApiOperation({ summary: 'Toggle comment like' })
  @ApiResponse({ 
    status: 200, 
    description: 'Comment like toggled successfully',
    type: CommentLikeResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async toggleCommentLike(
    @Body() commentLikeDto: CommentLikeDto,
    @Req() req: JwtRequest
  ): Promise<CommentLikeResponseDto> {
    const userId = req.user?.userId;
    return this.videosService.toggleCommentLike(commentLikeDto.commentId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('comment-like')
  @ApiOperation({ summary: 'Get comment like status' })
  @ApiQuery({ name: 'commentId', description: 'Comment ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Comment like status retrieved',
    type: CommentLikeResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async getCommentLikeStatus(
    @Query('commentId') commentId: string,
    @Req() req: JwtRequest
  ): Promise<CommentLikeResponseDto> {
    const userId = req.user?.userId;
    return this.videosService.getCommentLikeStatus(commentId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('reply-like')
  @ApiOperation({ summary: 'Toggle reply like' })
  @ApiResponse({ 
    status: 200, 
    description: 'Reply like toggled successfully',
    type: ReplyLikeResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Reply not found' })
  async toggleReplyLike(
    @Body() replyLikeDto: ReplyLikeDto,
    @Req() req: JwtRequest
  ): Promise<ReplyLikeResponseDto> {
    const userId = req.user?.userId;
    return this.videosService.toggleReplyLike(replyLikeDto.replyId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('reply-like')
  @ApiOperation({ summary: 'Get reply like status' })
  @ApiQuery({ name: 'replyId', description: 'Reply ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Reply like status retrieved',
    type: ReplyLikeResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Reply not found' })
  async getReplyLikeStatus(
    @Query('replyId') replyId: string,
    @Req() req: JwtRequest
  ): Promise<ReplyLikeResponseDto> {
    const userId = req.user?.userId;
    return this.videosService.getReplyLikeStatus(replyId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('replies')
  @ApiOperation({ summary: 'Get replies for a comment' })
  @ApiQuery({ name: 'commentId', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Replies retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async getReplies(
    @Query('commentId') commentId: string,
    @Req() req: JwtRequest
  ) {
    const userId = req.user?.userId;
    return this.videosService.getReplies(commentId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('replies')
  @ApiOperation({ summary: 'Create a reply to a comment' })
  @ApiResponse({ status: 201, description: 'Reply created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async createReply(
    @Body() createReplyDto: CreateReplyDto,
    @Req() req: JwtRequest
  ) {
    const userId = req.user?.userId;
    return this.videosService.createReply(createReplyDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('replies')
  @ApiOperation({ summary: 'Delete a reply' })
  @ApiQuery({ name: 'replyId', description: 'Reply ID' })
  @ApiResponse({ status: 200, description: 'Reply deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Reply not found' })
  async deleteReply(
    @Query('replyId') replyId: string,
    @Req() req: JwtRequest
  ) {
    const userId = req.user?.userId;
    return this.videosService.deleteReply(replyId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('comments')
  @ApiOperation({ summary: 'Get comments for a video' })
  @ApiQuery({ name: 'videoId', description: 'Video ID' })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async getComments(
    @Query('videoId') videoId: string,
    @Req() req: JwtRequest
  ) {
    const userId = req.user?.userId;
    return this.videosService.getComments(videoId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('comments')
  @ApiOperation({ summary: 'Create a comment on a video' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: JwtRequest
  ) {
    const userId = req.user?.userId;
    return this.videosService.createComment(createCommentDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('comments')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiQuery({ name: 'commentId', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async deleteComment(
    @Query('commentId') commentId: string,
    @Req() req: JwtRequest
  ) {
    const userId = req.user?.userId;
    return this.videosService.deleteComment(commentId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('like')
  @ApiOperation({ summary: 'Like a video' })
  @ApiResponse({ 
    status: 200, 
    description: 'Video liked successfully',
    type: VideoLikeResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async likeVideo(
    @Body() videoLikeDto: VideoLikeDto,
    @Req() req: JwtRequest
  ): Promise<VideoLikeResponseDto> {
    const userId = req.user?.userId;
    if (videoLikeDto.userId !== userId) {
      throw new Error('User ID mismatch');
    }
    return this.videosService.likeVideo(videoLikeDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('unlike')
  @ApiOperation({ summary: 'Unlike a video' })
  @ApiResponse({ 
    status: 200, 
    description: 'Video unliked successfully',
    type: VideoLikeResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async unlikeVideo(
    @Body() videoLikeDto: VideoLikeDto,
    @Req() req: JwtRequest
  ): Promise<VideoLikeResponseDto> {
    const userId = req.user?.userId;
    if (videoLikeDto.userId !== userId) {
      throw new Error('User ID mismatch');
    }
    return this.videosService.unlikeVideo(videoLikeDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('process-video')
  @ApiOperation({ summary: 'Process a video for transcription and processing' })
  @ApiResponse({ 
    status: 200, 
    description: 'Video processed successfully',
    type: ProcessVideoResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async processVideo(
    @Body() processVideoDto: ProcessVideoDto,
    @Req() req: JwtRequest
  ): Promise<ProcessVideoResponseDto> {
    const currentUserId = req.user?.userId;
    return this.videosService.processVideo(processVideoDto, currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a video file' })
  @ApiResponse({ 
    status: 201, 
    description: 'Video uploaded successfully',
    type: UploadVideoResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(
    @UploadedFile() file: any,
    @Body() uploadVideoDto: UploadVideoDto,
    @Req() req: JwtRequest
  ): Promise<UploadVideoResponseDto> {
    const currentUserId = req.user?.userId;
      if (!file) throw new BadRequestException('No video file provided');
  
    try {
      // Upload file to S3
      const { url, key } = await this.s3Service.uploadVideoFile(file, currentUserId);
      
      // Set the S3 URL and key in the DTO
      uploadVideoDto.videoUrl = url;
      uploadVideoDto.s3Key = key;

      return this.videosService.uploadVideo(uploadVideoDto, currentUserId);
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to upload video to S3');
    }
  }
}
