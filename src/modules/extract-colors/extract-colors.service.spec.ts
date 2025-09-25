import { Test, TestingModule } from '@nestjs/testing';
import { ExtractColorsService } from './extract-colors.service';

describe('ExtractColorsService', () => {
  let service: ExtractColorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExtractColorsService],
    }).compile();

    service = module.get<ExtractColorsService>(ExtractColorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
