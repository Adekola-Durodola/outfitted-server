import { PartialType } from '@nestjs/mapped-types';
import { CreateGoogleShoppingDto } from './create-google-shopping.dto';

export class UpdateGoogleShoppingDto extends PartialType(CreateGoogleShoppingDto) {}
