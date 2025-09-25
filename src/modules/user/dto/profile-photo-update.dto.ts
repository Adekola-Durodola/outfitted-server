import { IsString, IsUrl, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProfilePhotoUpdateDto {
  @ApiProperty({ 
    description: 'S3 URL of the uploaded profile photo',
    example: 'https://bucket-name.s3.region.amazonaws.com/profile-photos/user-id/timestamp-filename.jpg'
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;
} 