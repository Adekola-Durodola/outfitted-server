import { Test, TestingModule } from '@nestjs/testing';
import { GoogleShoppingService } from './google-shopping.service';

describe('GoogleShoppingService', () => {
  let service: GoogleShoppingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleShoppingService],
    }).compile();

    service = module.get<GoogleShoppingService>(GoogleShoppingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
