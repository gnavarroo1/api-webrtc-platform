import { Injectable } from '@nestjs/common';
import { UserDtoRepository } from '../../../infrastructure/repositories/user-dto.repository';
import { UserDto } from '../../../interfaces/dtos/user.dto';

@Injectable()
export class SecurityService {
  constructor(private readonly userDtoRespository: UserDtoRepository) {}
  async findOneByUsername(username: string): Promise<UserDto | undefined> {
    return this.userDtoRespository.findAttr({ username: username });
  }
  async findOneById(id: string): Promise<UserDto | undefined> {
    return this.userDtoRespository.findAttr({ _id: id });
  }
}
