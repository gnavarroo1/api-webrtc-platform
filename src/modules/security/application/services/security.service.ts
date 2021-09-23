import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserDtoRepository } from '../../infrastructure/repositories/user-dto.repository';
import { UserDto } from '../../interfaces/dtos/user.dto';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecurityService {
  constructor(
    private readonly userDtoRespository: UserDtoRepository,
    private configService: ConfigService,
  ) {}
  async findOneByUsername(username: string): Promise<UserDto> {
    const user = await this.userDtoRespository.findAttr({ username: username });
    if (user) {
      return user;
    }
    throw new HttpException(
      `User with the username:${username} doesn't exist`,
      HttpStatus.NOT_FOUND,
    );
  }
  async findOneById(id: string): Promise<UserDto> {
    const user = this.userDtoRespository.findAttr({ _id: id });
    if (user) {
      return user;
    }

    throw new HttpException(
      'User with this id does not exist',
      HttpStatus.NOT_FOUND,
    );
  }
  validatePassword(password: string, hash: string, salt: string): boolean {
    const tmpHash = crypto
      .pbkdf2Sync(
        password,
        salt,
        this.configService.get<number>('crypto.iterations'),
        this.configService.get<number>('crypto.keylen'),
        this.configService.get<string>('crypto.digest'),
      )
      .toString('hex');
    return hash === tmpHash;
  }
  getSaltHashPassword(password): { salt: string; hash: string } {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(
        password,
        salt,
        this.configService.get<number>('crypto.iterations'),
        this.configService.get<number>('crypto.keylen'),
        this.configService.get<string>('crypto.digest'),
      )
      .toString('hex');
    return {
      hash: hash,
      salt: salt,
    };
  }
}
