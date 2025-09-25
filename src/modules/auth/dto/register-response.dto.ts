import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../user/dto/user.dto';
import { TokenDto } from './token.dto';

export class RegisterResponseDto {
  @ApiProperty({
    description: 'User information',
    type: UserDto
  })
  user: UserDto;

  @ApiProperty({
    description: 'Authentication tokens',
    type: TokenDto
  })
  tokens: TokenDto;

  constructor(user: UserDto, accessToken: string, refreshToken: string) {
    this.user = user;
    this.tokens = new TokenDto(accessToken, refreshToken);
  }
} 