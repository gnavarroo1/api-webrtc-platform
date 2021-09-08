import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { EntityFactory } from '../../../shared/entity.factory';
import { User } from './aggregates/User';
import { UserEntityRepository } from '../infrastructure/repositories/user-entity.repository';
import * as crypto from 'crypto';

@Injectable()
export class UserFactory implements EntityFactory<User> {
  constructor(private readonly userEntityRepository: UserEntityRepository) {}
  salt = crypto.randomBytes(16).toString('hex');
  async create(
    username: string,
    email: string,
    firstname: string,
    lastname: string,
    isTemporary: boolean,
    password: string,
  ): Promise<User> {
    const user = new User(
      new ObjectId().toHexString(),
      username,
      email,
      firstname,
      lastname,
      isTemporary,
      this.salt,
      crypto
        .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
        .toString('hex'),
    );
    await this.userEntityRepository.create(user);
    return user;
  }
}