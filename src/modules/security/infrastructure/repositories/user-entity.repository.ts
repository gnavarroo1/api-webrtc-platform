import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseEntityRepository } from '../../../../shared/generics/base-entity.repository';
import { UserSchema } from '../../../../shared/infrastructure/schemas/user.schema';
import { User } from '../../domain/aggregates/User';
import { UserSchemaFactory } from '../schemas/user-schema.factory';

@Injectable()
export class UserEntityRepository extends BaseEntityRepository<
  UserSchema,
  User
> {
  constructor(
    @InjectModel(UserSchema.name)
    userModel: Model<UserSchema>,
    userSchemaFactory: UserSchemaFactory,
  ) {
    super(userModel, userSchemaFactory);
  }
}
