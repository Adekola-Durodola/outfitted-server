import { Test, TestingModule } from '@nestjs/testing';
import { FollowingAccountsController } from './following-accounts.controller';
import { FollowingAccountsService } from './following-accounts.service';

describe('FollowingAccountsController', () => {
  let controller: FollowingAccountsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowingAccountsController],
      providers: [FollowingAccountsService],
    }).compile();

    controller = module.get<FollowingAccountsController>(FollowingAccountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
