import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SuggestedUsersService } from './suggested-users.service';
import { CreateSuggestedUserDto } from './dto/create-suggested-user.dto';
import { UpdateSuggestedUserDto } from './dto/update-suggested-user.dto';

@Controller('suggested-users')
export class SuggestedUsersController {
  constructor(private readonly suggestedUsersService: SuggestedUsersService) {}

  @Post()
  create(@Body() createSuggestedUserDto: CreateSuggestedUserDto) {
    return this.suggestedUsersService.create(createSuggestedUserDto);
  }

  @Get()
  findAll() {
    return this.suggestedUsersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suggestedUsersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSuggestedUserDto: UpdateSuggestedUserDto) {
    return this.suggestedUsersService.update(+id, updateSuggestedUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.suggestedUsersService.remove(+id);
  }
}
