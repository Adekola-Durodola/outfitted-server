import { Injectable, BadRequestException, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Video } from './entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { User } from '../user/entities/user.entity';
import { Comment } from './entities/comment.entity';
import { CommentLike } from './entities/comment-like.entity';
import { CommentReply } from './entities/comment-reply.entity';
import { CommentReplyLike } from './entities/comment-reply-like.entity';
import { VideoLike } from './entities/video-like.entity';
import { Notification } from './entities/notification.entity';
import { Bookmark } from '../bookmarks/entities/bookmark.entity';
import { Sound } from './entities/sound.entity';
import { VideoStyle } from './entities/video-style.entity';
import { ScrapedData } from './entities/scraped-data.entity';
import { CommentLikeDto } from './dto/comment-like.dto';
import { ReplyLikeDto } from './dto/reply-like.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { VideoLikeDto } from './dto/video-like.dto';
import { ProcessVideoDto } from './dto/process-video.dto';
import { ProcessVideoResponseDto } from './dto/process-video-response.dto';
import { UploadVideoDto } from './dto/upload-video.dto';
import { UploadVideoResponseDto } from './dto/upload-video-response.dto';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { Op } from 'sequelize';
import { VideoResponseDto } from './dto/video-response.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { ReplyResponseDto } from './dto/reply-response.dto';
import { CommentLikeResponseDto } from './dto/comment-like-response.dto';
import { ReplyLikeResponseDto } from './dto/reply-like-response.dto';
import { VideoLikeResponseDto } from './dto/video-like-response.dto';
import { VideoListResponseDto } from './dto/video-list-response.dto';

@Injectable()
export class VideosService {
  constructor(
    @InjectModel(Video)
    private readonly videoModel: typeof Video,
    @InjectModel(Comment)
    private readonly commentModel: typeof Comment,
    @InjectModel(CommentLike)
    private readonly commentLikeModel: typeof CommentLike,
    @InjectModel(CommentReply)
    private readonly commentReplyModel: typeof CommentReply,
    @InjectModel(CommentReplyLike)
    private readonly commentReplyLikeModel: typeof CommentReplyLike,
    @InjectModel(VideoLike)
    private readonly videoLikeModel: typeof VideoLike,
    @InjectModel(Notification)
    private readonly notificationModel: typeof Notification,
    @InjectModel(Bookmark)
    private readonly bookmarkModel: typeof Bookmark,
    @InjectModel(Sound)
    private readonly soundModel: typeof Sound,
    @InjectModel(VideoStyle)
    private readonly videoStyleModel: typeof VideoStyle,
    @InjectModel(ScrapedData)
    private readonly scrapedDataModel: typeof ScrapedData,
    private sequelize: Sequelize,
    private configService: ConfigService,
  ) {
    // Initialize S3 client
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_BUCKET_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  private s3Client: S3Client;

  async findOne(videoId: string, currentUserId?: string): Promise<VideoResponseDto> {
    const video = await this.videoModel.findByPk(videoId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'userName', 'image']
        },
        {
          model: Bookmark,
          as: 'bookmarks',
          attributes: ['id', 'collectionId', 'userId']
        }
        // Note: For now, I'm including only the entities that exist in the current codebase
        // Sound, likes, comments, shares, and scrapedData would need their respective entities
      ]
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Transform to response DTO
    const videoResponse = this.transformToResponseDto(video, currentUserId);
    return videoResponse;
  }

  async update(videoId: string, updateVideoDto: UpdateVideoDto, currentUserId: string): Promise<VideoResponseDto> {
    // Check if video exists and belongs to current user
    const video = await this.videoModel.findByPk(videoId);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    if (video.userId !== currentUserId) {
      throw new UnauthorizedException('You can only update your own videos');
    }

    // Update video
    await this.videoModel.update(updateVideoDto, {
      where: { id: videoId }
    });

    // Return updated video
    return this.findOne(videoId, currentUserId);
  }

  async remove(videoId: string, currentUserId: string): Promise<{ message: string }> {
    // Check if video exists and belongs to current user
    const video = await this.videoModel.findByPk(videoId);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    if (video.userId !== currentUserId) {
      throw new UnauthorizedException('You can only delete your own videos');
    }

    // Delete video
    await this.videoModel.destroy({
      where: { id: videoId }
    });

    return { message: 'Video deleted successfully' };
  }

  async toggleCommentLike(commentId: string, userId: string): Promise<CommentLikeResponseDto> {
    // Validate comment exists
    const comment = await this.commentModel.findByPk(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user already liked the comment
    const existingLike = await this.commentLikeModel.findOne({
      where: { userId, commentId },
    });

    if (existingLike) {
      // Unlike the comment
      await existingLike.destroy();
      
      // Delete notification if exists
      await this.notificationModel.destroy({
        where: {
          senderId: userId,
          recipientId: comment.userId,
          type: 'comment_like',
          contentId: commentId,
        },
      });
    } else {
      // Like the comment
      await this.commentLikeModel.create({
        userId,
        commentId,
      });

      // Create notification (only if not liking own comment)
      if (userId !== comment.userId) {
        await this.notificationModel.create({
          recipientId: comment.userId,
          senderId: userId,
          type: 'comment_like',
          contentId: commentId,
          contentPreview: comment.content.substring(0, 50),
        });
      }
    }

    return this.getCommentLikeStatus(commentId, userId);
  }

  async getCommentLikeStatus(commentId: string, userId: string): Promise<CommentLikeResponseDto> {
    // Validate comment exists
    const comment = await this.commentModel.findByPk(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const likeCount = await this.commentLikeModel.count({
      where: { commentId },
    });

    const isLiked = await this.commentLikeModel.findOne({
      where: { userId, commentId },
    });

    return {
      isLiked: !!isLiked,
      likeCount,
      commentId,
    };
  }

  async toggleReplyLike(replyId: string, userId: string): Promise<ReplyLikeResponseDto> {
    // Validate reply exists
    const reply = await this.commentReplyModel.findByPk(replyId);
    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    // Check if user already liked the reply
    const existingLike = await this.commentReplyLikeModel.findOne({
      where: { userId, commentReplyId: replyId },
    });

    if (existingLike) {
      // Unlike the reply
      await existingLike.destroy();
      
      // Delete notification if exists
      await this.notificationModel.destroy({
        where: {
          senderId: userId,
          recipientId: reply.userId,
          type: 'reply_like',
          contentId: replyId,
        },
      });
    } else {
      // Like the reply
      await this.commentReplyLikeModel.create({
        userId,
        commentReplyId: replyId,
      });

      // Create notification (only if not liking own reply)
      if (userId !== reply.userId) {
        await this.notificationModel.create({
          recipientId: reply.userId,
          senderId: userId,
          type: 'reply_like',
          contentId: replyId,
          contentPreview: reply.content.substring(0, 50),
        });
      }
    }

    return this.getReplyLikeStatus(replyId, userId);
  }

  async getReplyLikeStatus(replyId: string, userId: string): Promise<ReplyLikeResponseDto> {
    // Validate reply exists
    const reply = await this.commentReplyModel.findByPk(replyId);
    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    const likeCount = await this.commentReplyLikeModel.count({
      where: { commentReplyId: replyId },
    });

    const isLiked = await this.commentReplyLikeModel.findOne({
      where: { userId, commentReplyId: replyId },
    });

    return {
      isLiked: !!isLiked,
      likeCount,
      replyId,
    };
  }

  async getReplies(commentId: string, userId?: string): Promise<ReplyResponseDto[]> {
    // Validate comment exists
    const comment = await this.commentModel.findByPk(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const replies = await this.commentReplyModel.findAll({
      where: { commentId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'userName', 'image'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    const repliesWithLikes = await Promise.all(
      replies.map(async (reply) => {
        const replyData = reply.toJSON();
        const likeCount = await this.commentReplyLikeModel.count({
          where: { commentReplyId: reply.id },
        });

        let isLiked = false;
        if (userId) {
          const existingLike = await this.commentReplyLikeModel.findOne({
            where: { userId, commentReplyId: reply.id },
          });
          isLiked = !!existingLike;
        }

        return {
          ...replyData,
          likeCount,
          isLiked,
        };
      })
    );

    return repliesWithLikes;
  }

  async createReply(createReplyDto: CreateReplyDto, userId: string): Promise<ReplyResponseDto> {
    // Validate comment exists
    const comment = await this.commentModel.findByPk(createReplyDto.commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Validate content
    if (!createReplyDto.content || createReplyDto.content.trim().length === 0) {
      throw new BadRequestException('Reply content cannot be empty');
    }

    const reply = await this.commentReplyModel.create({
      content: createReplyDto.content.trim(),
      userId,
      commentId: createReplyDto.commentId,
    });

    // Get user data
    const user = await User.findByPk(userId, {
      attributes: ['id', 'userName', 'image'],
    });

    // Create notification for comment owner (if not replying to own comment)
    if (userId !== comment.userId) {
      await this.notificationModel.create({
        recipientId: comment.userId,
        senderId: userId,
        type: 'video_comment',
        contentId: comment.id,
        contentPreview: createReplyDto.content.substring(0, 50),
      });
    }

    const replyData = reply.toJSON();
    return {
      ...replyData,
      user: user ? user.toJSON() : null,
      likeCount: 0,
      isLiked: false,
    };
  }

  async deleteReply(replyId: string, userId: string): Promise<void> {
    const reply = await this.commentReplyModel.findByPk(replyId);
    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    if (reply.userId !== userId) {
      throw new ForbiddenException('You can only delete your own replies');
    }

    await reply.destroy();
  }

  async getComments(videoId: string, userId?: string): Promise<CommentResponseDto[]> {
    // Validate video exists
    const video = await this.videoModel.findByPk(videoId);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const comments = await this.commentModel.findAll({
      where: { videoId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'userName', 'image'],
        },
        {
          model: this.commentReplyModel,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'userName', 'image'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const commentsWithLikes = await Promise.all(
      comments.map(async (comment) => {
        const commentData = comment.toJSON();
        const likeCount = await this.commentLikeModel.count({
          where: { commentId: comment.id },
        });

        const replyCount = await this.commentReplyModel.count({
          where: { commentId: comment.id },
        });

        let isLiked = false;
        if (userId) {
          const existingLike = await this.commentLikeModel.findOne({
            where: { userId, commentId: comment.id },
          });
          isLiked = !!existingLike;
        }

        // Process replies with like counts
        const repliesWithLikes = await Promise.all(
          commentData.replies.map(async (reply: any) => {
            const replyLikeCount = await this.commentReplyLikeModel.count({
              where: { commentReplyId: reply.id },
            });

            let replyIsLiked = false;
            if (userId) {
              const existingReplyLike = await this.commentReplyLikeModel.findOne({
                where: { userId, commentReplyId: reply.id },
              });
              replyIsLiked = !!existingReplyLike;
            }

            return {
              ...reply,
              likeCount: replyLikeCount,
              isLiked: replyIsLiked,
            };
          })
        );

        return {
          ...commentData,
          replies: repliesWithLikes,
          likeCount,
          replyCount,
          isLiked,
        };
      })
    );

    return commentsWithLikes;
  }

  async createComment(createCommentDto: CreateCommentDto, userId: string): Promise<CommentResponseDto> {
    // Validate video exists
    const video = await this.videoModel.findByPk(createCommentDto.videoId);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Validate content
    if (!createCommentDto.content || createCommentDto.content.trim().length === 0) {
      throw new BadRequestException('Comment content cannot be empty');
    }

    const comment = await this.commentModel.create({
      content: createCommentDto.content.trim(),
      userId,
      videoId: createCommentDto.videoId,
    });

    // Get user data
    const user = await User.findByPk(userId, {
      attributes: ['id', 'userName', 'image'],
    });

    // Create notification for video owner (if not commenting on own video)
    if (userId !== video.userId) {
      await this.notificationModel.create({
        recipientId: video.userId,
        senderId: userId,
        type: 'video_comment',
        contentId: video.id,
        contentPreview: createCommentDto.content.substring(0, 50),
      });
    }

    const commentData = comment.toJSON();
    return {
      ...commentData,
      user: user ? user.toJSON() : null,
      replies: [],
      likeCount: 0,
      replyCount: 0,
      isLiked: false,
    };
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentModel.findByPk(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await comment.destroy();
  }

  async likeVideo(videoLikeDto: VideoLikeDto): Promise<VideoLikeResponseDto> {
    // Validate video exists
    const video = await this.videoModel.findByPk(videoLikeDto.postId);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Check if already liked
    const existingLike = await this.videoLikeModel.findOne({
      where: { userId: videoLikeDto.userId, videoId: videoLikeDto.postId },
    });

    if (existingLike) {
      throw new BadRequestException('Video already liked');
    }

    // Create like
    await this.videoLikeModel.create({
      userId: videoLikeDto.userId,
      videoId: videoLikeDto.postId,
    });

    // Create notification (only if not liking own video)
    if (videoLikeDto.userId !== video.userId) {
      await this.notificationModel.create({
        recipientId: video.userId,
        senderId: videoLikeDto.userId,
        type: 'like',
        contentId: video.id,
        contentPreview: video.caption || 'Video',
      });
    }

    return this.getVideoLikeStatus(videoLikeDto.postId, videoLikeDto.userId);
  }

  async unlikeVideo(videoLikeDto: VideoLikeDto): Promise<VideoLikeResponseDto> {
    // Validate video exists
    const video = await this.videoModel.findByPk(videoLikeDto.postId);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Find and delete like
    const existingLike = await this.videoLikeModel.findOne({
      where: { userId: videoLikeDto.userId, videoId: videoLikeDto.postId },
    });

    if (!existingLike) {
      throw new BadRequestException('Video not liked');
    }

    await existingLike.destroy();

    // Delete notification
    await this.notificationModel.destroy({
      where: {
        senderId: videoLikeDto.userId,
        recipientId: video.userId,
        type: 'like',
        contentId: video.id,
      },
    });

    return this.getVideoLikeStatus(videoLikeDto.postId, videoLikeDto.userId);
  }

  async findAll(currentUserId?: string): Promise<VideoListResponseDto[]> {
    try {
      const videos = await this.videoModel.findAll({
        attributes: ['id', 'url', 'caption', 'description', 'views', 'userId', 'createdAt', 'updatedAt'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'userName', 'name', 'image'],
          },
          {
            model: this.videoLikeModel,
            as: 'likes',
            attributes: ['userId'],
          },
          {
            model: Bookmark,
            as: 'bookmarks',
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      const videosWithIsLiked = videos.map((video) => {
        const videoData = video.toJSON();
        return {
          ...videoData,
          isLiked: currentUserId
            ? videoData.likes?.some((like: any) => like.userId === currentUserId) || false
            : false,
          // Map sound data to maintain backward compatibility (placeholder for now)
          soundId: undefined,
          soundUrl: undefined,
          soundTitle: undefined,
          soundArtist: undefined,
          soundThumbnail: undefined,
          // Placeholder for other entities that might be added later
          shares: [],
          scrapedData: undefined,
          comments: [], // Simplified for now
        };
      });

      return videosWithIsLiked;
    } catch (error) {
      throw new BadRequestException('Failed to fetch videos');
    }
  }

  async processVideo(dto: ProcessVideoDto, userId: string): Promise<ProcessVideoResponseDto> {
    const {
      videoId,
      videoUrl,
      generateHLS = true,
      generateThumbnail = true,
      thumbnailTime = 2,
    } = dto;

    // Verify video exists and belongs to user
    const video = await this.videoModel.findByPk(videoId, {
      attributes: ['id', 'userId', 'url'],
    });

    if (!video || video.userId !== userId) {
      throw new NotFoundException('Video not found or unauthorized');
    }

    const results: {
      hlsUrl?: string;
      thumbnailUrl?: string;
      segments?: string[];
      error?: string;
    } = {};

    try {
      // Create temporary directory for processing
      const tempDir = path.join('/tmp', `video-${uuidv4()}`);
      await fs.mkdir(tempDir, { recursive: true });

      // Download original video to temp location
      const inputPath = path.join(tempDir, 'input.mp4');
      await this.downloadVideoFromS3(videoUrl, inputPath);

      // Generate thumbnail if requested
      if (generateThumbnail) {
        try {
          const thumbnailUrl = await this.generateVideoThumbnail(
            inputPath,
            videoId,
            thumbnailTime,
            tempDir
          );
          results.thumbnailUrl = thumbnailUrl;
        } catch (error) {
          console.error('Thumbnail generation failed:', error);
          results.error = 'Thumbnail generation failed';
        }
      }

      // Generate HLS if requested
      if (generateHLS) {
        try {
          const hlsResult = await this.generateHLSStream(
            inputPath,
            videoId,
            tempDir
          );
          results.hlsUrl = hlsResult.playlistUrl;
          results.segments = hlsResult.segmentUrls;
        } catch (error) {
          console.error('HLS generation failed:', error);
          results.error = results.error
            ? `${results.error}, HLS generation failed`
            : 'HLS generation failed';
        }
      }

      // Clean up temp directory
      await fs.rm(tempDir, { recursive: true, force: true });

      // Update video record with processed URLs
      const updateData: any = {};
      if (results.hlsUrl) {
        updateData.hlsUrl = results.hlsUrl;
      }
      if (results.thumbnailUrl) {
        updateData.thumbnailUrl = results.thumbnailUrl;
      }

      if (Object.keys(updateData).length > 0) {
        await this.videoModel.update(updateData, {
          where: { id: videoId },
        });
      }

      return {
        success: true,
        videoId,
        ...results,
      };
    } catch (processingError) {
      console.error('Video processing error:', processingError);
      throw new BadRequestException('Video processing failed');
    }
  }

  async uploadVideo(dto: UploadVideoDto, userId: string): Promise<UploadVideoResponseDto> {
    // Validate user exists
    const user = await User.findByPk(userId);
    if (!user) throw new UnauthorizedException('User not found. Please log in again.');

    // Parse and validate input data
    const {videoUrl, s3Key, caption = '', description = '', styles = '', productLinks = '', sound } = dto as any;

    // Debug logging
    console.log('=== UPLOAD VIDEO DEBUG ===');
    console.log('Received DTO:', JSON.stringify(dto, null, 2));
    console.log('Sound data:', sound);
    console.log('Sound type:', typeof sound);
    console.log('Sound keys:', sound ? Object.keys(sound) : 'N/A');

    // Alternative approach: check for individual sound fields
    const rawDto = dto as any;
    let processedSound = sound;

    // CRITICAL FIX: Parse JSON string if sound is received as string
    if (typeof processedSound === 'string') {
      console.log('Sound received as JSON string, parsing...');
      try {
        processedSound = JSON.parse(processedSound);
        console.log('Successfully parsed sound JSON:', processedSound);
      } catch (parseError) {
        console.error('Failed to parse sound JSON:', parseError);
        processedSound = null;
      }
    }

    // If sound is not properly parsed, try to construct it from individual fields
    if (!processedSound || typeof processedSound !== 'object') {
      console.log('Sound not properly parsed, checking individual fields...');
    }

    // Always check for individual sound fields as a fallback/supplement
    const individualSoundFields = {
      title: rawDto.soundTitle,
      artist: rawDto.soundArtist,
      url: rawDto.soundUrl,
      thumbnail: rawDto.soundThumbnail,
      externalId: rawDto.soundExternalId,
      embedUrl: rawDto.soundEmbedUrl,
      duration: rawDto.soundDuration,
    };

    // Filter out undefined/null/empty individual fields
    const validIndividualFields = Object.fromEntries(
      Object.entries(individualSoundFields).filter(([_, value]) => value && value.toString().trim())
    );

    let mergedSound = processedSound || {};

    // Merge individual fields with nested sound object (individual fields take precedence)
    if (Object.keys(validIndividualFields).length > 0) {
      mergedSound = { ...mergedSound, ...validIndividualFields };
      console.log('Merged individual fields with sound object:', mergedSound);
    }

    // Check if we have any sound data at all
    const hasSoundData = mergedSound && Object.values(mergedSound).some(value => value && value.toString().trim());
    if (hasSoundData) {
      processedSound = mergedSound;
      console.log('Final processed sound data:', processedSound);
    } else {
      processedSound = null;
      console.log('No valid sound data found');
    }

    // Determine final video URL
    let finalVideoUrl: string;
    if (videoUrl && s3Key) {
      finalVideoUrl = videoUrl;
    } else {
      throw new BadRequestException('No video file or URL provided');
    }

    // Parse styles
    let stylesArray: string[] = [];
    if (styles && Array.isArray(styles)) {
      stylesArray = styles.filter(
        (style) => style && typeof style === 'string' && style.trim()
      );
    }

    // Parse product links
    let productLinksArray: string[] = [];
    if (productLinks && Array.isArray(productLinks)) {
      productLinksArray = productLinks.filter(
        (url: any) => typeof url === 'string' && url.trim() !== ''
      );
    }

    // Use transaction for atomic operations
    const result = await this.sequelize.transaction(async (transaction) => {
      let soundId = null;

      // Handle sound creation/retrieval
      console.log('Sound condition check:', {
        processedSound: !!processedSound,
        hasTitle: processedSound?.title,
        hasExternalId: processedSound?.externalId,
        hasUrl: processedSound?.url,
        hasArtist: processedSound?.artist,
        conditionResult: !!(processedSound && (processedSound.title || processedSound.externalId || processedSound.url || processedSound.artist))
      });

      if (processedSound && (processedSound.title || processedSound.externalId || processedSound.url || processedSound.artist)) {
        console.log('Entering sound creation logic...');
        try {
          // Check if sound already exists - look for exact match on all key fields
          let existingSound = null;

          if (processedSound.externalId) {
            // First try to find by externalId and sourceType
            existingSound = await this.soundModel.findOne({
              where: {
                externalId: processedSound.externalId,
                sourceType: 'youtube',
              },
              transaction
            });

            // If found, check if the data matches - if not, we'll create a new sound
            if (existingSound) {
              const dataMatches = (
                existingSound.title === (processedSound.title || 'Unknown Title') &&
                existingSound.artist === (processedSound.artist || 'Unknown Artist') &&
                existingSound.url === (processedSound.url || null) &&
                existingSound.thumbnail === (processedSound.thumbnail || null) &&
                existingSound.embedUrl === (processedSound.embedUrl || null) &&
                existingSound.duration === (processedSound.duration || null)
              );

              if (!dataMatches) {
                console.log('Existing sound found but data does not match - will create new sound');
                existingSound = null; // Reset to create new sound
              } else {
                console.log('Existing sound found with matching data');
              }
            }
          }

          console.log('Existing sound found:', !!existingSound);

          if (!existingSound) {
            console.log('Creating new sound since no existing sound found or data does not match');
            // Create new sound
            console.log('Creating new sound with data:', {
              title: processedSound.title || 'Unknown Title',
              artist: processedSound.artist || 'Unknown Artist',
              url: processedSound.url || null,
              thumbnail: processedSound.thumbnail || null,
              externalId: processedSound.externalId || null,
              embedUrl: processedSound.embedUrl || null,
              duration: processedSound.duration || null,
              sourceType: 'youtube',
              usageCount: 1,
            });

            existingSound = await this.soundModel.create({
              title: processedSound.title || 'Unknown Title',
              artist: processedSound.artist || 'Unknown Artist',
              url: processedSound.url || null,
              thumbnail: processedSound.thumbnail || null,
              externalId: processedSound.externalId || null,
              embedUrl: processedSound.embedUrl || null,
              duration: processedSound.duration || null,
              sourceType: 'youtube',
              usageCount: 1,
            }, { transaction });

            console.log('New sound created with ID:', existingSound.id);
          } else {
            // Increment usage count for existing sound
            console.log('Updating existing sound usage count for ID:', existingSound.id);
            await this.soundModel.update({
              usageCount: existingSound.usageCount + 1,
            }, {
              where: { id: existingSound.id },
              transaction
            });
          }

          soundId = existingSound.id;
          console.log('Sound ID set to:', soundId);
        } catch (soundError) {
          console.error('Error handling sound:', soundError);
          soundId = null;
        }
      }

      // Create video
      const video = await this.videoModel.create({
        url: finalVideoUrl,
        caption: caption || '',
        description: description || null,
        userId: userId,
        soundId: soundId || null,
      }, { transaction });

      // Handle video styles
      if (stylesArray.length > 0) {
        const stylePromises = stylesArray.map((styleName) =>
          this.videoStyleModel.create({
            videoId: video.id,
            name: styleName.trim(),
            styleId: styleName.toLowerCase().replace(/\s+/g, '-'),
          }, { transaction })
        );

        await Promise.all(stylePromises);
      }

      return video;
    });

    // Trigger video processing in background (disabled for now)
    // this.triggerVideoProcessing(result.id, finalVideoUrl).catch((error) => {
    //   console.error('Video processing trigger failed:', error);
    // });

    // Call scraping API if product links are provided
    let scrapingSuccess = false;
    if (productLinksArray.length > 0) {
      try {
        const scrapingResponse = await fetch(
          `${this.configService.get<string>('SCRAPING_API_URL') || 'https://fastapi.outfitted.me'}/scrape/products`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              urls: productLinksArray,
              user_id: userId,
              video_id: result.id,
            }),
          }
        );

        if (scrapingResponse.ok) {
          const scrapingResult = await scrapingResponse.json();

          // Create scrapedData record on successful scraping
          await this.scrapedDataModel.create({
            userId: userId,
            videoId: result.id,
            productsData: scrapingResult,
          });

          scrapingSuccess = true;
        } else {
          const errorText = await scrapingResponse.text();
          console.error(
            'Scraping API returned error:',
            scrapingResponse.status,
            errorText
          );
        }
      } catch (error) {
        console.error('Error calling scraping endpoint:', error);
      }
    }

    // Fetch the updated video with all relations
    const updatedVideo = await this.videoModel.findByPk(result.id, {
      include: [
        {
          model: this.scrapedDataModel,
          as: 'scrapedData',
          order: [['createdAt', 'DESC']],
        },
        {
          model: this.videoStyleModel,
          as: 'styles',
        },
        {
          model: this.soundModel,
          as: 'sound',
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'userName', 'name', 'image'],
        },
      ],
    });

    // Transform scraped data for easier frontend consumption
    const transformedVideo = {
      ...updatedVideo.toJSON(),
      scrapedData:
        updatedVideo?.scrapedData?.map((item) => ({
          id: item.id,
          createdAt: item.createdAt,
          productsData: Array.isArray(item.productsData)
            ? item.productsData
            : typeof item.productsData === 'string'
              ? JSON.parse(item.productsData)
              : [item.productsData],
        })) || [],
    };

    return {
      success: true,
      videoInfo: {
        caption,
        description,
        videoUrl: finalVideoUrl,
      },
      video: transformedVideo,
      scrapingStatus:
        productLinksArray.length > 0
          ? scrapingSuccess
            ? 'completed'
            : 'failed'
          : 'not_requested',
    };
  }

  private async triggerVideoProcessing(videoId: string, videoUrl: string) {
    try {
      // Use setTimeout to make it truly async/background
      setTimeout(async () => {
        try {
          const response = await fetch(
            `${this.configService.get<string>('API_BASE_URL') || 'http://localhost:3000'}/videos/process-video`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                videoId,
                videoUrl,
                generateHLS: true,
                generateThumbnail: true,
                thumbnailTime: 2,
              }),
            }
          );

          if (!response.ok) {
            console.error('Video processing failed:', await response.text());
          } else {
            console.log('Video processing started successfully for:', videoId);
          }
        } catch (error) {
          console.error('Error triggering video processing:', error);
        }
      }, 1000); // Start processing 1 second after upload completion
    } catch (error) {
      console.error('Failed to schedule video processing:', error);
    }
  }

  private async downloadVideoFromS3(
    videoUrl: string,
    outputPath: string
  ): Promise<void> {
    const bucketName = this.configService.get<string>('AWS_BUCKET_NAME');
    const key = videoUrl
      .split(`${bucketName}.s3.`)[1]
      ?.split('.amazonaws.com/')[1];

    if (!key) {
      throw new Error('Invalid S3 URL');
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await this.s3Client.send(command);
    const chunks: Buffer[] = [];

    if (response.Body) {
      const stream = response.Body as any;
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
    }

    const buffer = Buffer.concat(chunks);
    await fs.writeFile(outputPath, buffer);
  }

  private async generateVideoThumbnail(
    inputPath: string,
    videoId: string,
    thumbnailTime: number,
    tempDir: string
  ): Promise<string> {
    const thumbnailPath = path.join(tempDir, 'thumbnail.jpg');

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .screenshots({
          count: 1,
          timemarks: [`${thumbnailTime}`],
          filename: 'thumbnail.jpg',
          folder: tempDir,
          size: '360x640',
        })
        .on('end', () => resolve())
        .on('error', (error) => reject(error));
    });

    const thumbnailBuffer = await fs.readFile(thumbnailPath);
    const thumbnailKey = `videos/thumbnails/${videoId}/thumbnail.jpg`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
        Key: thumbnailKey,
        Body: thumbnailBuffer,
        ContentType: 'image/jpeg',
        CacheControl: 'max-age=31536000',
      })
    );

    return `https://${this.configService.get<string>('AWS_BUCKET_NAME')}.s3.${this.configService.get<string>('AWS_BUCKET_REGION')}.amazonaws.com/${thumbnailKey}`;
  }

  private async generateHLSStream(
    inputPath: string,
    videoId: string,
    tempDir: string
  ): Promise<{ playlistUrl: string; segmentUrls: string[] }> {
    const hlsDir = path.join(tempDir, 'hls');
    await fs.mkdir(hlsDir, { recursive: true });

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-profile:v baseline',
          '-level 3.0',
          '-start_number 0',
          '-hls_time 4',
          '-hls_list_size 0',
          '-f hls',
          '-c:v libx264',
          '-c:a aac',
          '-b:v 1500k',
          '-b:a 128k',
          '-s 720x1280',
        ])
        .output(path.join(hlsDir, 'playlist.m3u8'))
        .on('end', () => resolve())
        .on('error', (error) => reject(error));
    });

    const hlsFiles = await fs.readdir(hlsDir);
    const segmentUrls: string[] = [];

    for (const file of hlsFiles) {
      const filePath = path.join(hlsDir, file);
      const fileBuffer = await fs.readFile(filePath);
      const s3Key = `videos/hls/${videoId}/${file}`;

      const contentType = file.endsWith('.m3u8')
        ? 'application/vnd.apple.mpegurl'
        : 'video/MP2T';

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
          Key: s3Key,
          Body: fileBuffer,
          ContentType: contentType,
          CacheControl: file.endsWith('.m3u8')
            ? 'max-age=60'
            : 'max-age=31536000',
        })
      );

      const fileUrl = `https://${this.configService.get<string>('AWS_BUCKET_NAME')}.s3.${this.configService.get<string>('AWS_BUCKET_REGION')}.amazonaws.com/${s3Key}`;

      if (file.endsWith('.ts')) {
        segmentUrls.push(fileUrl);
      }
    }

    const playlistUrl = `https://${this.configService.get<string>('AWS_BUCKET_NAME')}.s3.${this.configService.get<string>('AWS_BUCKET_REGION')}.amazonaws.com/videos/hls/${videoId}/playlist.m3u8`;

    return { playlistUrl, segmentUrls };
  }

  private transformToResponseDto(video: any, currentUserId?: string): VideoResponseDto {
    // Check if current user liked the video (placeholder for now)
    const isLiked = false; // TODO: Implement likes functionality

    // Filter sensitive bookmark data for non-authenticated users
    const bookmarks = currentUserId ? (video.bookmarks || []) : [];

    return {
      id: video.id,
      url: video.url,
      caption: video.caption,
      description: video.description,
      views: video.views,
      userId: video.userId,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
      user: {
        id: video.user?.id,
        userName: video.user?.userName,
        image: video.user?.image,
        followedBy: [], // TODO: Implement follow functionality
        following: []   // TODO: Implement follow functionality
      },
      sound: undefined, // TODO: Implement sound functionality
      likes: [], // TODO: Implement likes functionality
      comments: [], // TODO: Implement comments functionality
      bookmarks: bookmarks,
      shares: [], // TODO: Implement shares functionality
      scrapedData: undefined, // TODO: Implement scraped data functionality
      isLiked,
      // Backward compatibility fields
      soundId: undefined,
      soundUrl: undefined,
      soundTitle: undefined,
      soundArtist: undefined,
      soundThumbnail: undefined
    };
  }

  private async getVideoLikeStatus(videoId: string, userId: string): Promise<VideoLikeResponseDto> {
    const video = await this.videoModel.findByPk(videoId);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const likeCount = await this.videoLikeModel.count({
      where: { videoId },
    });

    const isLiked = await this.videoLikeModel.findOne({
      where: { userId, videoId },
    });

    return {
      id: video.id,
      url: video.url,
      caption: video.caption,
      description: video.description,
      views: video.views,
      userId: video.userId,
      isLiked: !!isLiked,
      likeCount,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
    };
  }
}
