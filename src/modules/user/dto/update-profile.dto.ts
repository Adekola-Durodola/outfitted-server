import { IsOptional, IsString, IsUrl, MaxLength, MinLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ 
    description: 'User name',
    minLength: 1,
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ 
    description: 'Username - 3-30 characters, letters, numbers, periods, and underscores only',
    minLength: 3,
    maxLength: 30
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9._]+$/, {
    message: 'Username must contain only letters, numbers, periods, and underscores'
  })
  userName?: string;

  @ApiPropertyOptional({ 
    description: 'User bio',
    maxLength: 300
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string;

  @ApiPropertyOptional({ 
    description: 'TikTok profile URL',
    maxLength: 100
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(100)
  tiktok?: string;

  @ApiPropertyOptional({ 
    description: 'Profile image URL',
    maxLength: 500
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  image?: string;

  @ApiPropertyOptional({ 
    description: 'User region',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;
} 