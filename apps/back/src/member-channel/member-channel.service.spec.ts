import { Test, TestingModule } from '@nestjs/testing';
import { MemberChannelService } from './member-channel.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MemberChannelService', () => {
  let service: MemberChannelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberChannelService,
        {
          provide: PrismaService,
          useValue: {
            memberChannel: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MemberChannelService>(MemberChannelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
