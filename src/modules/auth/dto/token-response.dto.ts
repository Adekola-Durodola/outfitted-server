import { TokenDto } from './token.dto';

export class TokenResponseDto extends TokenDto {
  constructor(accessToken: string, refreshToken: string) {
    super(accessToken, refreshToken);
  }
} 