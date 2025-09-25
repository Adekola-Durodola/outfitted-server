import { Controller, Post, Body, Req } from '@nestjs/common';
import { UploadService } from './upload.service';
import { Throttle } from '@nestjs/throttler';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Throttle({default: { limit: 20, ttl: 60000 }})
  @Post('presigned-url')
  generatePresigned(@Req() req: any, @Body() body: { fileName: string; fileType: string; fileSize: number }) {
    const userId = req.user?.id;
    return this.uploadService.generatePresignedUrl(userId, body.fileName, body.fileType, body.fileSize);
  }
}
