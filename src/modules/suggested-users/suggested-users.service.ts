import { Injectable } from '@nestjs/common';
import { CreateSuggestedUserDto } from './dto/create-suggested-user.dto';
import { UpdateSuggestedUserDto } from './dto/update-suggested-user.dto';

@Injectable()
export class SuggestedUsersService {
  create(createSuggestedUserDto: CreateSuggestedUserDto) {
    return 'This action adds a new suggestedUser';
  }

  findAll() {
    return `This action returns all suggestedUsers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} suggestedUser`;
  }

  update(id: number, updateSuggestedUserDto: UpdateSuggestedUserDto) {
    return `This action updates a #${id} suggestedUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} suggestedUser`;
  }
}
