import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mock<Repository<User>>(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Mocked<Repository<User>>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'test',
        email: 'test@gmail.com',
      };
      const user = { id: 'uuid-1', ...createUserDto };

      repo.create.mockReturnValue(user);
      repo.save.mockResolvedValue(user);

      const result = await service.create(createUserDto);

      expect(repo.create).toHaveBeenCalledWith(createUserDto);
      expect(repo.save).toHaveBeenCalledWith(user);
      expect(result).toEqual(user);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        { id: 'uuid-1', name: 'test', email: 'test@gmail.com' },
      ] as User[];
      repo.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a single user by id', async () => {
      const user = {
        id: 'uuid-1',
        name: 'test',
        email: 'test@gmail.com',
      };
      repo.findOneBy.mockResolvedValue(user);

      const result = await service.findOne('uuid-1');

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 'uuid-1' });
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should update and return the user if found', async () => {
      const existingUser = {
        id: 'uuid-1',
        name: 'test',
        email: 'test@gmail.com',
      };
      const updateUserDto: UpdateUserDto = { name: 'updated name' };
      const updatedUser = { ...existingUser, ...updateUserDto };

      repo.findOneBy.mockResolvedValue(existingUser);
      repo.save.mockResolvedValue(updatedUser);

      const result = await service.update('uuid-1', updateUserDto);

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 'uuid-1' });
      expect(repo.save).toHaveBeenCalledWith({
        ...existingUser,
        ...updateUserDto,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user to update is not found', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(
        service.update('invalid-id', { name: 'updated name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a user by id', async () => {
      const deleteResult = { raw: [], affected: 1 };
      repo.delete.mockResolvedValue(deleteResult);

      const result = await service.remove('uuid-1');

      expect(repo.delete).toHaveBeenCalledWith({ id: 'uuid-1' });
      expect(result).toEqual(deleteResult);
    });
  });
});
