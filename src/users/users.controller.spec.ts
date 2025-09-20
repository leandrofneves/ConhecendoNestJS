import { UsersController } from './users.controller';

describe('user controller', () => {
  let controller: UsersController;

  const UserServiceMock = {
    findAll: jest.fn(),
  };

  beforeEach(() => {
    controller = new UsersController(UserServiceMock as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('find all users', async () => {
    await controller.findAllUsers();
    expect(UserServiceMock.findAll).toHaveBeenCalled();
  });
});
