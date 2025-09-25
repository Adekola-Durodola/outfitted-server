import { IsUUID } from 'class-validator';

export class FollowingQueryDto {
  @IsUUID()
  userId: string;
} 