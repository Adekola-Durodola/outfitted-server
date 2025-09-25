import { IsString, IsDateString, MinLength, MaxLength, Matches, IsArray, IsOptional, IsNumber, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class OnboardingProgressDto {
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9._]+$/)
  userName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  styles?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  followedCreators?: string[];

  @IsOptional()
  @IsNumber()
  currentStep?: number;
} 