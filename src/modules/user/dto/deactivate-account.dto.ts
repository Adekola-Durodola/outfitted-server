import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DeactivateAccountDto {
  @ApiPropertyOptional({ 
    description: 'User password (required for email/password accounts)',
    example: 'userpassword123'
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ 
    description: 'Reason for account deactivation',
    example: 'No longer using the platform',
    minLength: 1
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  reason: string;
} 