import { PartialType } from '@nestjs/mapped-types';
import { CreateExtractColorDto } from './create-extract-color.dto';

export class UpdateExtractColorDto extends PartialType(CreateExtractColorDto) {}
