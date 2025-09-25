import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

export interface UploadUrlRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface UploadUrlResponse {
  signedUrl: string;
  key: string;
  uploadUrl: string;
}

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;
  private bucketRegion: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('PUBLIC_AWS_BUCKET_NAME');
    this.bucketRegion = this.configService.get<string>('PUBLIC_AWS_BUCKET_REGION');
    
    this.s3Client = new S3Client({
      region: this.bucketRegion,
      credentials: {
        accessKeyId: this.configService.get<string>('PUBLIC_AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('AWS_ACCESS_SECRET_KEY'),
      },
    });
  }

  async generateProfilePhotoUploadUrl(userId: string, request: UploadUrlRequest): Promise<UploadUrlResponse> {
    const { fileName, fileType, fileSize } = request;

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    
    if (!allowedTypes.includes(fileType)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (fileSize > maxSize) {
      const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
      throw new Error(`File size exceeds ${maxSizeMB}MB limit. Your file is ${fileSizeMB}MB.`);
    }

    // Generate unique file key
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const key = `profile-photos/${userId}/${Date.now()}-${uniqueFileName}`;

    // Create S3 command
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: fileType,
      ContentLength: fileSize,
      Metadata: {
        userId,
        originalFileName: fileName,
        uploadedAt: new Date().toISOString(),
        uploadType: 'profile-photo',
      },
    });

    // Generate presigned URL (expires in 1 hour)
    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    const uploadUrl = `https://${this.bucketName}.s3.${this.bucketRegion}.amazonaws.com/${key}`;

    return {
      signedUrl,
      key,
      uploadUrl,
    };
  }

  async uploadVideoFile(file: any, userId: string): Promise<{ url: string; key: string }> {
    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only MP4 and WebM videos are allowed.');
    }

    // Validate file size (30MB limit)
    const maxSize = 30 * 1024 * 1024; // 30MB
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
      throw new Error(`File size exceeds ${maxSizeMB}MB limit. Your file is ${fileSizeMB}MB.`);
    }

    // Generate unique file key
    const fileExtension = file.originalname.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const key = `videos/${userId}/${Date.now()}-${uniqueFileName}`;

    // Create S3 command
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size,
      Metadata: {
        userId,
        originalFileName: file.originalname,
        uploadedAt: new Date().toISOString(),
        uploadType: 'video',
      },
    });

    // Upload to S3
    await this.s3Client.send(command);

    const url = `https://${this.bucketName}.s3.${this.bucketRegion}.amazonaws.com/${key}`;

    return {
      url,
      key,
    };
  }

  async deleteObject(key: string): Promise<void> {
    // Implementation for deleting objects from S3
    // This can be used for cleanup operations
  }
} 