import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mock<UsersService>(),
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<Mocked<UsersService>>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const user = {
        id: 'uuid-1',
        name: 'test',
        email: 'test@gmail.com',
      };
      const createUserDto: CreateUserDto = {
        name: 'test',
        email: 'test@gmail.com',
      };
      service.create.mockResolvedValue(user);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(user);
    });
  });

  describe('findAll', () => {
    it('should find all users', async () => {
      const users = [
        { id: 'uuid-1', name: 'test', email: 'test@gmail.com' },
      ] as User[];
      service.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should find one user by id', async () => {
      const user = {
        id: 'uuid-1',
        name: 'test',
        email: 'test@gmail.com',
      };
      service.findOne.mockResolvedValue(user);

      const result = await controller.findOne('uuid-1');

      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updatedUser = {
        id: 'uuid-1',
        name: 'updated name',
        email: 'test@gmail.com',
      };
      const updateUserDto: UpdateUserDto = { name: 'updated name' };
      service.update.mockResolvedValue(updatedUser);

      const result = await controller.update('uuid-1', updateUserDto);

      expect(service.update).toHaveBeenCalledTimes(1);
      expect(service.update).toHaveBeenCalledWith('uuid-1', updateUserDto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should remove a user by id', async () => {
      const deleteResult = { raw: [], affected: 1 };
      service.remove.mockResolvedValue(deleteResult);

      const result = await controller.remove('uuid-1');

      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(service.remove).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual(deleteResult);
    });
  });
});
