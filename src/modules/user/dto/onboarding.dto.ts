import { IsString, IsDateString, MinLength, MaxLength, Matches, IsArray, ArrayMinSize, IsOptional } from 'class-validator';

export class OnboardingDto {
  @IsDateString()
  dateOfBirth: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9._]+$/)
  userName: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  styles: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  followedCreators?: string[];
} 