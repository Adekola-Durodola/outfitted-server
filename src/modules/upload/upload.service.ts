import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly s3 = new S3Client({
    region: process.env.AWS_BUCKET_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY!,
    },
  });

  async generatePresignedUrl(userId: string, fileName: string, fileType: string, fileSize: number) {
    if (!userId) throw new UnauthorizedException();
    if (!fileName || !fileType || !fileSize) throw new BadRequestException('fileName, fileType and fileSize are required');

    const allowedTypes = ['video/mp4', 'video/webm'];
    if (!allowedTypes.includes(fileType)) throw new BadRequestException('Invalid file type');
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (fileSize > maxSize) throw new BadRequestException('File exceeds 50MB');

    const ext = fileName.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${ext}`;
    const key = `videos/${userId}/${Date.now()}-${uniqueFileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      ContentType: fileType,
      ContentLength: fileSize,
      Metadata: {
        userId,
        originalFileName: fileName,
        uploadedAt: new Date().toISOString(),
      },
    });

    const signedUrl = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    const uploadUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${key}`;

    return { signedUrl, key, uploadUrl };
  }
}
