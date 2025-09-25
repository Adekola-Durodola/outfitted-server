import { ApiProperty } from '@nestjs/swagger';

export class VerifyPasswordResponseDto {
  @ApiProperty({
    description: 'Whether the password verification was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Password verified successfully'
  })
  message: string;
} 