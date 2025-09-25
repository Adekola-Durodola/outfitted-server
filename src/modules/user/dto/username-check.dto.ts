import { MinLength, MaxLength, Matches } from 'class-validator';

export class UsernameCheckDto {
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9._]+$/)
  userName: string;
} 