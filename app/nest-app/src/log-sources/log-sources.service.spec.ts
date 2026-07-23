import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLogSourceDto } from './dto/create-log-source.dto';
import { UpdateLogSourceDto } from './dto/update-log-source.dto';
import {
  LogSource,
  LogSourceStatus,
  LogSourceType,
} from './entities/log-source.entity';
import { LogSourcesService } from './log-sources.service';

describe('LogSourcesService', () => {
  let service: LogSourcesService;
  let repo: Mocked<Repository<LogSource>>;

  const mockLogSource: LogSource = {
    id: 'logsource-uuid-1',
    ownerId: 'owner-1',
    name: 'Zabbix Main',
    description: 'Main Zabbix Server',
    status: LogSourceStatus.UNKNOWN,
    type: LogSourceType.ZABBIX,
    config: { url: 'http://localhost:8080' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogSourcesService,
        {
          provide: getRepositoryToken(LogSource),
          useValue: mock<Repository<LogSource>>(),
        },
      ],
    }).compile();

    service = module.get<LogSourcesService>(LogSourcesService);
    repo = module.get<Mocked<Repository<LogSource>>>(
      getRepositoryToken(LogSource),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a log source', async () => {
      const dto: CreateLogSourceDto = {
        name: 'Zabbix Main',
        description: 'Main Zabbix Server',
        type: LogSourceType.ZABBIX,
        config: { url: 'http://localhost:8080' },
      };

      const ownerId = 'owner-1';
      const created = { ...mockLogSource };
      const saved = { ...mockLogSource };

      repo.create.mockReturnValue(created);
      repo.save.mockResolvedValue(saved);

      const result = await service.create(dto, ownerId);

      expect(repo.create).toHaveBeenCalledTimes(1);
      expect(repo.create).toHaveBeenCalledWith({
        ...dto,
        status: LogSourceStatus.UNKNOWN,
        ownerId,
      });
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(saved);
    });
  });

  describe('findAll', () => {
    it('should return an array of log sources for the owner', async () => {
      const ownerId = 'owner-1';
      const sources = [mockLogSource];
      repo.find.mockResolvedValue(sources);

      const result = await service.findAll(ownerId);

      expect(repo.find).toHaveBeenCalledTimes(1);
      expect(repo.find).toHaveBeenCalledWith({ where: { ownerId } });
      expect(result).toEqual(sources);
    });
  });

  describe('findOne', () => {
    it('should return a single log source by id and ownerId', async () => {
      repo.findOne.mockResolvedValue(mockLogSource);

      const result = await service.findOne('logsource-uuid-1', 'owner-1');

      expect(repo.findOne).toHaveBeenCalledTimes(1);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'logsource-uuid-1', ownerId: 'owner-1' },
      });
      expect(result).toEqual(mockLogSource);
    });

    it('should throw NotFoundException if log source is not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id', 'owner-1')).rejects.toThrow(
        new NotFoundException('Log source with ID "invalid-id" not found'),
      );
    });
  });

  describe('update', () => {
    it('should update and return the log source if found', async () => {
      const updateDto: UpdateLogSourceDto = {
        name: 'Updated Zabbix Name',
      };
      const existing = { ...mockLogSource };
      const updated = { ...existing, ...updateDto };

      repo.findOne.mockResolvedValue(existing);
      repo.save.mockResolvedValue(updated);

      const result = await service.update(
        'logsource-uuid-1',
        updateDto,
        'owner-1',
      );

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'logsource-uuid-1', ownerId: 'owner-1' },
      });
      expect(repo.save).toHaveBeenCalledWith({
        ...mockLogSource,
        name: 'Updated Zabbix Name',
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if log source to update is not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.update('invalid-id', { name: 'New Name' }, 'owner-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove and return the log source', async () => {
      repo.findOne.mockResolvedValue(mockLogSource);
      repo.remove.mockResolvedValue(mockLogSource);

      const result = await service.remove('logsource-uuid-1', 'owner-1');

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'logsource-uuid-1', ownerId: 'owner-1' },
      });
      expect(repo.remove).toHaveBeenCalledWith(mockLogSource);
      expect(result).toEqual(mockLogSource);
    });

    it('should throw NotFoundException if log source to remove is not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.remove('invalid-id', 'owner-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
