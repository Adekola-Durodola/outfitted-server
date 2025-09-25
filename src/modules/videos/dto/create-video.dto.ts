import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateVideoDto {
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  userId: string;
}
