import { Prop, Schema } from '@nestjs/mongoose';
import { IdentifiableEntitySchema } from '../../generics/identifiable-entity.schema';

@Schema({ versionKey: false, collection: 'users' })
export class UserSchema extends IdentifiableEntitySchema {
  @Prop({ type: String, required: true })
  readonly firstname: string;
  @Prop({ type: String, required: true })
  readonly lastname: string;
  @Prop({ type: String, required: true, unique: true })
  readonly username: string;
  @Prop({ type: String, required: true, unique: true })
  readonly email: string;
  @Prop({ type: Boolean, default: false })
  readonly isTemporary: boolean;
  @Prop()
  salt: string;
  @Prop()
  hash: string;
}
