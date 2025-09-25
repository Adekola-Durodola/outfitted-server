import { IsString, IsNumber, IsNotEmpty, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProfilePhotoUploadDto {
  @ApiProperty({ 
    description: 'Original file name',
    example: 'profile-photo.jpg'
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ 
    description: 'File MIME type',
    example: 'image/jpeg',
    enum: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  })
  @IsString()
  @IsNotEmpty()
  fileType: string;

  @ApiProperty({ 
    description: 'File size in bytes',
    example: 1024000,
    minimum: 1,
    maximum: 5242880 // 5MB
  })
  @IsNumber()
  @Min(1)
  @Max(5242880) // 5MB in bytes
  fileSize: number;
} 