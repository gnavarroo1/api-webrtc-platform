import { Prop, Schema } from '@nestjs/mongoose';
import { IdentifiableEntitySchema } from '../../generics/identifiable-entity.schema';

@Schema({ versionKey: false, collection: 'users' })
export class UserSchema extends IdentifiableEntitySchema {
  @Prop()
  readonly firstname: string;
  @Prop()
  readonly lastname: string;
  @Prop({ required: true, unique: true })
  readonly username: string;
  @Prop()
  readonly email: string;
  @Prop()
  readonly isTemporary: boolean;
  @Prop()
  salt: string;
  @Prop()
  hash: string;
}
