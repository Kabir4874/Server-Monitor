import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRemoteServerDto } from './dto/create-remote-server.dto';
import { UpdateRemoteServerDto } from './dto/update-remote-server.dto';
import {
  RemoteServer,
  RemoteServerStatus,
} from './entities/remote-server.entity';

@Injectable()
export class RemoteServersService {
  constructor(
    @InjectRepository(RemoteServer) private repo: Repository<RemoteServer>,
  ) {}

  create(props: CreateRemoteServerDto, ownerId: string) {
    const remoteServer = this.repo.create({
      ...props,
      status: RemoteServerStatus.UNKNOWN,
      ownerId,
    });
    return this.repo.save(remoteServer);
  }

  findAll(ownerId: string) {
    return this.repo.find({ where: { ownerId } });
  }

  async findOne(id: string, ownerId: string) {
    const server = await this.repo.findOne({ where: { id, ownerId } });
    if (!server) {
      throw new NotFoundException(`Remote server with ID "${id}" not found`);
    }
    return server;
  }

  async update(
    id: string,
    updateRemoteServerDto: UpdateRemoteServerDto,
    ownerId: string,
  ) {
    const server = await this.findOne(id, ownerId);
    Object.assign(server, updateRemoteServerDto);
    return this.repo.save(server);
  }

  async remove(id: string, ownerId: string) {
    const server = await this.findOne(id, ownerId);
    return this.repo.remove(server);
  }
}
