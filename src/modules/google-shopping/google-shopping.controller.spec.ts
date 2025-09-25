import { Test, TestingModule } from '@nestjs/testing';
import { GoogleShoppingController } from './google-shopping.controller';
import { GoogleShoppingService } from './google-shopping.service';

describe('GoogleShoppingController', () => {
  let controller: GoogleShoppingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleShoppingController],
      providers: [GoogleShoppingService],
    }).compile();

    controller = module.get<GoogleShoppingController>(GoogleShoppingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
