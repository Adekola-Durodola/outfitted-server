import { Test, TestingModule } from '@nestjs/testing';
import { SuggestedUsersService } from './suggested-users.service';

describe('SuggestedUsersService', () => {
  let service: SuggestedUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuggestedUsersService],
    }).compile();

    service = module.get<SuggestedUsersService>(SuggestedUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
