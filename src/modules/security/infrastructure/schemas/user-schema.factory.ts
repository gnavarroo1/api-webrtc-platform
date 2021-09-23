import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { EntitySchemaFactory } from '../../../../shared/generics/entity-schema.factory';
import { UserSchema } from '../../../../shared/infrastructure/schemas/user.schema';
import { User } from '../../domain/aggregates/User';

@Injectable()
export class UserSchemaFactory
  implements EntitySchemaFactory<UserSchema, User>
{
  create(entity: User): UserSchema {
    return {
      _id: new ObjectId(entity.id),
      username: entity.username,
      email: entity.email,
      firstname: entity.firstname,
      lastname: entity.lastname,
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
      entitySchema.salt,
      entitySchema.hash,
    );
  }
}
