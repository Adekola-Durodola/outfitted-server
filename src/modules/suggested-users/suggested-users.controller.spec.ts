import { Test, TestingModule } from '@nestjs/testing';
import { SuggestedUsersController } from './suggested-users.controller';
import { SuggestedUsersService } from './suggested-users.service';

describe('SuggestedUsersController', () => {
  let controller: SuggestedUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuggestedUsersController],
      providers: [SuggestedUsersService],
    }).compile();

    controller = module.get<SuggestedUsersController>(SuggestedUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
