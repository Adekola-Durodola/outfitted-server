import { Test, TestingModule } from '@nestjs/testing';
import { ExtractColorsController } from './extract-colors.controller';
import { ExtractColorsService } from './extract-colors.service';

describe('ExtractColorsController', () => {
  let controller: ExtractColorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExtractColorsController],
      providers: [ExtractColorsService],
    }).compile();

    controller = module.get<ExtractColorsController>(ExtractColorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
