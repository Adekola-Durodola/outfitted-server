import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  userName?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  bio?: string;

  @ApiPropertyOptional()
  tiktok?: string;

  @ApiPropertyOptional()
  image?: string;

  @ApiPropertyOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional()
  region?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiProperty()
  hasPassword: boolean;
} 