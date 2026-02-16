import { Test, TestingModule } from '@nestjs/testing';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { MessagesService } from '../messages/messages.service';

jest.mock('src/auth/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

describe('ChannelController', () => {
  let controller: ChannelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelController],
      providers: [
        {
          provide: ChannelService,
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            listMember: jest.fn(),
            join: jest.fn(),
            leave: jest.fn(),
          },
        },
        {
          provide: MessagesService,
          useValue: {
            create: jest.fn(),
            messageHistory: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ChannelController>(ChannelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
