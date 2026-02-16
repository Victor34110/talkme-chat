import { Test, TestingModule } from '@nestjs/testing';
import { MemberChannelController } from './member-channel.controller';
import { MemberChannelService } from './member-channel.service';

jest.mock('src/auth/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

describe('MemberChannelController', () => {
  let controller: MemberChannelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberChannelController],
      providers: [
        {
          provide: MemberChannelService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MemberChannelController>(MemberChannelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
