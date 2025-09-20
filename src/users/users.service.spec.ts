import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from './users.service';
import { HashingServiceProtocol } from 'src/auth/hash/hashing.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserService', () => {
  let UserService: UsersService;
  let prismaService: PrismaService;
  let hashService: HashingServiceProtocol;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue({
                id: '1',
                name: 'matheus junior',
                email: 'matheus.junior@gmail.com',
              }),
            },
          },
        },
        {
          provide: HashingServiceProtocol,
          useValue: {
            hash: jest.fn().mockResolvedValue('hashed_password'),
          },
        },
      ],
    }).compile();

    UserService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    hashService = module.get<HashingServiceProtocol>(HashingServiceProtocol);
  });

  it('should be defined users service', () => {
    expect(UserService).toBeDefined();
  });

  it('should be defined prisma service', () => {
    expect(prismaService).toBeDefined();
  });

  it('should be defined hash service', () => {
    expect(hashService).toBeDefined();
  });

  it('should create a user', async () => {
    const createUserDto: CreateUserDto = {
      name: 'matheus junior',
      email: 'matheus.junior@gmail.com',
      password: '123456',
    };

    await UserService.create(createUserDto);

    expect(prismaService.user.create).toHaveBeenCalledWith({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        passwordHash: 'hashed_password',
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  });
});
