import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { UserSchema } from '../../../../shared/infrastructure/schemas/user.schema';
import { UserDto } from '../../interfaces/dtos/user.dto';

@Injectable()
export class UserDtoRepository {
  constructor(
    @InjectModel(UserSchema.name)
    private readonly userModel: Model<UserSchema>,
  ) {}

  async findAttr(entityFilterQuery: FilterQuery<UserSchema>): Promise<UserDto> {
    return this.userModel.findOne(entityFilterQuery);
  }
  async find(entityFilterQuery: FilterQuery<UserSchema>): Promise<UserDto[]> {
    return this.userModel.find(entityFilterQuery);
  }
}
