import { IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DateOfBirthDto {
  @ApiProperty({ 
    description: 'Date of birth in ISO string format',
    example: '1990-01-01T00:00:00.000Z'
  })
  @IsString()
  @IsNotEmpty()
  @IsDateString()
  dateOfBirth: string;
} 