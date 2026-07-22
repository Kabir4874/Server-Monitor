import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateRemoteServerDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  config: Record<string, any>;
}
