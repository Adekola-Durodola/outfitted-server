import { Controller, Get, Post, Delete, Body, Query, BadRequestException } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Throttle({default: { limit: 100, ttl: 60000 }})
  @Get('check')
  async check(@Query('userId') userId: string, @Query('videoId') videoId: string) {
    if (!userId || !videoId) {
      throw new BadRequestException('userId and videoId query parameters are required');
    }
    const bookmark = await this.bookmarksService.check(userId, videoId);
    return {
      isBookmarked: !!bookmark,
      bookmark,
    };
  }

  @Get()
  async detailed(@Query('userId') userId: string, @Query('videoId') videoId: string) {
    if (!userId || !videoId) {
      throw new BadRequestException('userId and videoId query parameters are required');
    }
    const bookmark = await this.bookmarksService.check(userId, videoId);
    if (!bookmark) {
      return { isBookmarked: false, videoDetails: null };
    }
    return {
      isBookmarked: true,
      videoDetails: {
        ...bookmark.video?.toJSON?.(),
        bookmarkedAt: bookmark.createdAt,
        collectionName: bookmark.collection?.name || null,
      },
    };
  }

  @Throttle({default: { limit: 60, ttl: 60000 }})
  @Post()
  createOrUpdate(@Body() dto: CreateBookmarkDto) {
    return this.bookmarksService.createOrUpdate(dto);
  }

  @Throttle({default: { limit: 60, ttl: 60000 }})
  @Delete()
  remove(@Body() dto: CreateBookmarkDto & { collectionId?: string | null }) {
    return this.bookmarksService.remove(dto);
  }
}
