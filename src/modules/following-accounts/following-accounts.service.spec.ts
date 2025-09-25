import { Test, TestingModule } from '@nestjs/testing';
import { FollowingAccountsService } from './following-accounts.service';

describe('FollowingAccountsService', () => {
  let service: FollowingAccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FollowingAccountsService],
    }).compile();

    service = module.get<FollowingAccountsService>(FollowingAccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
