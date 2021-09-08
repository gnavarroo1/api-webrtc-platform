import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseEntityRepository } from '../../../../shared/base-entity.repository';
import { UserSchema } from '../schemas/user.schema';
import { User } from '../../domain/aggregates/User';
import { UserSchemaFactory } from '../schemas/user-schema.factory';
import { ObjectID } from 'mongodb';

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
