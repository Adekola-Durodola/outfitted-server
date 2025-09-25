import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({
    description: 'The email of the user',
    example: 'test@example.com',
  })
  email: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({
    description: 'The password of the user',
    example: 'password',
  })
  password: string;
  
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @ApiProperty({
    description: 'The username of the user',
    example: 'testuser',
  })
  userName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  name?: string;

}
