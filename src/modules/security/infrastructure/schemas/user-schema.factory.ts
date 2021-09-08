import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { EntitySchemaFactory } from '../../../../shared/entity-schema.factory';
import { UserSchema } from './user.schema';
import { User } from '../../domain/aggregates/User';
import * as crypto from 'crypto';

@Injectable()
export class UserSchemaFactory
  implements EntitySchemaFactory<UserSchema, User>
{
  create(entity: User): UserSchema {
    const salt = crypto.randomBytes(16).toString('hex');

    return {
      _id: new ObjectId(entity.id),
      username: entity.username,
      email: entity.email,
      firstname: entity.firstname,
      lastname: entity.lastname,
      isTemporary: entity.isTemporary,
      salt: entity.salt,
      hash: entity.hash,
    };
  }

  createFromSchema(entitySchema: UserSchema): User {
    return new User(
      entitySchema._id.toHexString(),
      entitySchema.username,
      entitySchema.email,
      entitySchema.firstname,
      entitySchema.lastname,
      entitySchema.isTemporary,
      entitySchema.salt,
      entitySchema.hash,
    );
  }
}
