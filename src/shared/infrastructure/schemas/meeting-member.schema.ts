import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IdentifiableEntitySchema } from '../../generics/identifiable-entity.schema';
import * as mongoose from 'mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { UserSchema } from './user.schema';

@Schema({ versionKey: false, collection: 'meetingmembers', timestamps: true })
export class MeetingMemberDocument extends IdentifiableEntitySchema {
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: UserSchema.name,
    required: true,
  })
  readonly userId: Types.ObjectId;
  @Prop({
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'meetings',
    required: true,
  })
  readonly meetingId: Types.ObjectId;
  @Prop({ type: String, required: true })
  readonly nickname: string;
  @Prop({
    type: String,
    default: 'BOTH',
    enum: ['BOTH', 'PRODUCER', 'CONSUMER'],
  })
  readonly memberType: string;
  @Prop({ type: String, required: true })
  readonly socketId: string;
  @Prop({ type: Boolean, default: true })
  readonly isActive: boolean;
}

const MeetingMemberSchema = SchemaFactory.createForClass(MeetingMemberDocument);

MeetingMemberSchema.virtual('meetingInfo', {
  ref: 'meetings',
  localField: 'meetingId',
  foreignField: '_id',
  justOne: true,
  match: {
    active: true,
  },
});

export { MeetingMemberSchema };
