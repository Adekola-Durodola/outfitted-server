import { IsString, IsUUID } from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  name: string;

  @IsUUID()
  userId: string;
}
