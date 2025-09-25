import { IsEmail, IsString, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleSignupDto {
  @ApiProperty({
    description: 'Google user ID',
    example: '123456789012345678901'
  })
  @IsString()
  providerId: string;

  @ApiProperty({
    description: 'User email from Google',
    example: 'user@gmail.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User name from Google',
    example: 'John Doe'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'User avatar URL from Google',
    example: 'https://lh3.googleusercontent.com/a/ACg8ocK...',
    required: false
  })
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ApiProperty({
    description: 'Username (optional)',
    example: 'johndoe',
    required: false
  })
  @IsOptional()
  @IsString()
  userName?: string;
}


