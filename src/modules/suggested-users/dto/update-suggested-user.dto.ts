import { PartialType } from '@nestjs/mapped-types';
import { CreateSuggestedUserDto } from './create-suggested-user.dto';

export class UpdateSuggestedUserDto extends PartialType(CreateSuggestedUserDto) {}
