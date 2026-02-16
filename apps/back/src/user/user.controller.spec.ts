import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

jest.mock('src/auth/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            signup: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
            findme: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('signup should call userService.signup', async () => {
    const dto = { username: 't', email: 'e', password: 'p' };
    await controller.signup(dto);
    expect(controller['userService'].signup).toHaveBeenCalledWith(dto);
  });

  it('login should call userService.login', async () => {
    await controller.login({ username: 't', email: 'e', password: 'p' });
    expect(controller['userService'].login).toHaveBeenCalled();
  });

  it('logout should call userService.logout', async () => {
    await controller.logout({ username: 't', email: 'e', password: 'p' });
    expect(controller['userService'].logout).toHaveBeenCalled();
  });

  it('findAll should call userService.findAll', async () => {
    await controller.findAll();
    expect(controller['userService'].findAll).toHaveBeenCalled();
  });

  it('findOne should call userService.findOne', async () => {
    await controller.findOne('1');
    expect(controller['userService'].findOne).toHaveBeenCalledWith('1');
  });

  it('update should call userService.update', async () => {
    const dto = { username: 'u', password: 'p', email: 'e' };
    await controller.update('1', dto);
    expect(controller['userService'].update).toHaveBeenCalledWith('1', dto);
  });

  it('remove should call userService.remove', async () => {
    await controller.remove('1');
    expect(controller['userService'].remove).toHaveBeenCalledWith('1');
  });
});
