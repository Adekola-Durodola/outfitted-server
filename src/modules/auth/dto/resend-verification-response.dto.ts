import { ApiProperty } from '@nestjs/swagger';

export class ResendVerificationResponseDto {
  @ApiProperty({
    description: 'Whether the verification email was sent successfully',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Verification email sent successfully'
  })
  message: string;
}
