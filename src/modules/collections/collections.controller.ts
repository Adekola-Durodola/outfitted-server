import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Throttle({default: { limit: 30, ttl: 60000 }})
  @Post()
  create(@Body() createCollectionDto: CreateCollectionDto) {
    return this.collectionsService.create(createCollectionDto);
  }

  @Throttle({default: { limit: 60, ttl: 60000 }})
  @Get()
  findAll(@Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('userId query param is required');
    return this.collectionsService.findAllByUser(userId);
  }

  @Throttle({default: { limit: 60, ttl: 60000 }})
  @Get(':id')
  findOne(@Param('id') id: string, @Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('userId query param is required');
    return this.collectionsService.findOne(id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCollectionDto) {
    return this.collectionsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.collectionsService.remove(id);
  }
}
