import { PartialType } from '@nestjs/mapped-types';
import { CreateFollowingAccountDto } from './create-following-account.dto';

export class UpdateFollowingAccountDto extends PartialType(CreateFollowingAccountDto) {}
