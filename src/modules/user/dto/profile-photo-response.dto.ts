import { ApiProperty } from '@nestjs/swagger';

export class ProfilePhotoUploadResponseDto {
  @ApiProperty({ 
    description: 'Presigned URL for uploading the file to S3',
    example: 'https://bucket-name.s3.region.amazonaws.com/profile-photos/user-id/timestamp-filename.jpg?X-Amz-Algorithm=...'
  })
  signedUrl: string;

  @ApiProperty({ 
    description: 'S3 object key',
    example: 'profile-photos/user-id/1234567890-uuid-filename.jpg'
  })
  key: string;

  @ApiProperty({ 
    description: 'Final URL where the file will be accessible after upload',
    example: 'https://bucket-name.s3.region.amazonaws.com/profile-photos/user-id/timestamp-filename.jpg'
  })
  uploadUrl: string;
} 