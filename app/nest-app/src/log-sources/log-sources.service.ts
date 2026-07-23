import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLogSourceDto } from './dto/create-log-source.dto';
import { UpdateLogSourceDto } from './dto/update-log-source.dto';
import { LogSource, LogSourceStatus } from './entities/log-source.entity';

@Injectable()
export class LogSourcesService {
  constructor(
    @InjectRepository(LogSource) private repo: Repository<LogSource>,
  ) {}

  create(props: CreateLogSourceDto, ownerId: string) {
    const logSource = this.repo.create({
      ...props,
      ownerId,
      status: LogSourceStatus.UNKNOWN,
    });
    return this.repo.save(logSource);
  }

  findAll(ownerId: string) {
    return this.repo.find({ where: { ownerId } });
  }

  async findOne(id: string, ownerId: string) {
    const logSource = await this.repo.findOne({ where: { id, ownerId } });
    if (!logSource) {
      throw new NotFoundException(`Log source with ID "${id}" not found`);
    }
    return logSource;
  }

  async update(
    id: string,
    updateLogSourceDto: UpdateLogSourceDto,
    ownerId: string,
  ) {
    const logSource = await this.findOne(id, ownerId);
    if (!logSource) {
      throw new NotFoundException(`Log source with ID "${id}" not found`);
    }
    Object.assign(logSource, updateLogSourceDto);
    return this.repo.save(logSource);
  }

  async remove(id: string, ownerId: string) {
    const logSource = await this.findOne(id, ownerId);
    if (!logSource) {
      throw new NotFoundException(`Log source with ID "${id}" not found`);
    }
    return this.repo.remove(logSource);
  }
}
