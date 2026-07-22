import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRemoteServerDto } from './dto/create-remote-server.dto';
import { UpdateRemoteServerDto } from './dto/update-remote-server.dto';
import {
  RemoteServer,
  RemoteServerStatus,
} from './entities/remote-server.entity';
import { RemoteServersService } from './remote-servers.service';

describe('RemoteServersService', () => {
  let service: RemoteServersService;
  let repo: Mocked<Repository<RemoteServer>>;

  const mockServer: RemoteServer = {
    id: 'server-uuid-1',
    ownerId: 'owner-1',
    name: 'Production Server',
    description: 'Main app server',
    config: { host: '192.168.1.1', port: 22 },
    status: RemoteServerStatus.UNKNOWN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoteServersService,
        {
          provide: getRepositoryToken(RemoteServer),
          useValue: mock<Repository<RemoteServer>>(),
        },
      ],
    }).compile();

    service = module.get<RemoteServersService>(RemoteServersService);
    repo = module.get<Mocked<Repository<RemoteServer>>>(
      getRepositoryToken(RemoteServer),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a remote server', async () => {
      const dto: CreateRemoteServerDto = {
        name: 'Production Server',
        description: 'Main app server',
        config: { host: '192.168.1.1', port: 22 },
      };

      const ownerId = 'owner-1';
      const createdServer = { ...mockServer };
      const savedServer = { ...mockServer };

      repo.create.mockReturnValue(createdServer);
      repo.save.mockResolvedValue(savedServer);

      const result = await service.create(dto, ownerId);

      expect(repo.create).toHaveBeenCalledTimes(1);
      expect(repo.create).toHaveBeenCalledWith({
        ...dto,
        status: RemoteServerStatus.UNKNOWN,
        ownerId,
      });
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith(createdServer);
      expect(result).toEqual(savedServer);
    });
  });

  describe('findAll', () => {
    it('should return an array of remote servers for the owner', async () => {
      const ownerId = 'owner-1';
      const servers = [mockServer];
      repo.find.mockResolvedValue(servers);

      const result = await service.findAll(ownerId);

      expect(repo.find).toHaveBeenCalledTimes(1);
      expect(repo.find).toHaveBeenCalledWith({ where: { ownerId } });
      expect(result).toEqual(servers);
    });
  });

  describe('findOne', () => {
    it('should return a single remote server by id and ownerId', async () => {
      repo.findOne.mockResolvedValue(mockServer);

      const result = await service.findOne('server-uuid-1', 'owner-1');

      expect(repo.findOne).toHaveBeenCalledTimes(1);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'server-uuid-1', ownerId: 'owner-1' },
      });
      expect(result).toEqual(mockServer);
    });

    it('should throw NotFoundException if server is not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id', 'owner-1')).rejects.toThrow(
        new NotFoundException('Remote server with ID "invalid-id" not found'),
      );
    });
  });

  describe('update', () => {
    it('should update and return the remote server if found', async () => {
      const updateDto: UpdateRemoteServerDto = {
        name: 'Updated Server Name',
      };
      const existingServer = { ...mockServer };
      const updatedServer = { ...existingServer, ...updateDto };

      repo.findOne.mockResolvedValue(existingServer);
      repo.save.mockResolvedValue(updatedServer);

      const result = await service.update(
        'server-uuid-1',
        updateDto,
        'owner-1',
      );

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'server-uuid-1', ownerId: 'owner-1' },
      });
      expect(repo.save).toHaveBeenCalledWith({
        ...mockServer,
        name: 'Updated Server Name',
      });
      expect(result).toEqual(updatedServer);
    });

    it('should throw NotFoundException if server to update is not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.update('invalid-id', { name: 'New Name' }, 'owner-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove and return the remote server', async () => {
      repo.findOne.mockResolvedValue(mockServer);
      repo.remove.mockResolvedValue(mockServer);

      const result = await service.remove('server-uuid-1', 'owner-1');

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'server-uuid-1', ownerId: 'owner-1' },
      });
      expect(repo.remove).toHaveBeenCalledWith(mockServer);
      expect(result).toEqual(mockServer);
    });

    it('should throw NotFoundException if server to remove is not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.remove('invalid-id', 'owner-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
