import { Test, TestingModule } from '@nestjs/testing';
import { MeController } from './me.controller';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('@thallesp/nestjs-better-auth', () => ({
  BetterAuthGuard: class {
    canActivate() {
      return true;
    }
  },
  AuthModule: {
    forRoot: jest.fn().mockReturnValue({ module: class {}, providers: [] }),
  },
}));

jest.mock('../auth/auth', () => ({
  auth: { api: { getSession: jest.fn() } },
}));

describe('MeController', () => {
  let controller: MeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            member: { findFirst: jest.fn() },
          },
        },
      ],
    }).compile();

    controller = module.get<MeController>(MeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('me should return something', () => {
    expect(controller.me()).toBeUndefined();
  });
});
