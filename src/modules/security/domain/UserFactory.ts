import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { EntityFactory } from '../../../shared/generics/entity.factory';
import { User } from './aggregates/User';
import { UserEntityRepository } from '../infrastructure/repositories/user-entity.repository';
import { UserCreatedEvent } from '../application/events/create-user/user-created.event';

@Injectable()
export class UserFactory implements EntityFactory<User> {
  constructor(private readonly userEntityRepository: UserEntityRepository) {}
  async create(
    username: string,
    email: string,
    firstname: string,
    lastname: string,
    salt: string,
    hash: string,
    verified = false,
  ): Promise<User> {
    const user = new User(
      new ObjectId().toHexString(),
      username,
      email,
      firstname,
      lastname,
      salt,
      hash,
      verified,
    );
    await this.userEntityRepository.create(user);
    user.apply(
      new UserCreatedEvent({
        email: email,
        _id: user.id,
        username: username,
      }),
    );
    return user;
  }
}
