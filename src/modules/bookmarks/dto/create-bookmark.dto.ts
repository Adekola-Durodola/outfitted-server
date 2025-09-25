import { IsUUID, IsOptional } from 'class-validator';

export class CreateBookmarkDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  videoId: string;

  @IsOptional()
  @IsUUID()
  collectionId?: string;
}
