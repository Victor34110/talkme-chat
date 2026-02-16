import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

jest.mock('@thallesp/nestjs-better-auth', () => ({
  AuthModule: {
    forRoot: jest.fn().mockReturnValue({
      module: class {},
      providers: [],
    }),
  },
  BetterAuthGuard: class {
    canActivate() {
      return true;
    }
  },
}));

jest.mock('../src/auth/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn().mockResolvedValue({ user: { id: 'u1' } }),
    },
  },
}));

jest.mock('../src/auth/auth.guard', () => ({
  BetterAuthGuard: class {
    canActivate(context: any) {
      const req = context.switchToHttp().getRequest();
      req.user = { id: 'u1' };
      return true;
    }
  },
}));

describe('Core Flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn().mockResolvedValue({ id: 'u1', name: 'User' }),
      findMany: jest.fn(),
    },
    server: {
      create: jest.fn().mockResolvedValue({ server_id: 1, name: 'Server' }),
      findMany: jest.fn().mockResolvedValue([{ server_id: 1, name: 'Server' }]),
      findFirst: jest.fn(),
    },
    member: {
      create: jest.fn().mockResolvedValue({ member_id: 1 }),
      findFirst: jest.fn().mockResolvedValue({ member_id: 1, role: 'owner' }),
    },
    channel: {
      create: jest.fn().mockResolvedValue({ channel_id: 1, name: 'Channel' }),
      findMany: jest
        .fn()
        .mockResolvedValue([{ channel_id: 1, name: 'Channel' }]),
      findFirst: jest
        .fn()
        .mockResolvedValue({ channel_id: 1, name: 'Channel', server_id: 1 }),
    },
    memberChannel: {
      create: jest.fn().mockResolvedValue({}),
    },
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  it('Flow: Create Server -> Create Channel', async () => {
    // 1. Create Server
    const serverRes = await request(app.getHttpServer())
      .post('/servers')
      .send({ name: 'My Server' })
      .expect(201);

    expect(serverRes.body.server_id).toBe(1);

    // 2. Create Channel in that server
    const channelRes = await request(app.getHttpServer())
      .post('/servers/1/channels')
      .send({ name: 'General', server_id: '1' })
      .expect(201);

    expect(channelRes.body.channel_id).toBe(1);
  });

  afterAll(async () => {
    await app.close();
  });
});
