import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IdentifiableEntitySchema } from '../../generics/identifiable-entity.schema';
import { SchemaTypes, Types } from 'mongoose';
import { UserSchema } from './user.schema';
import { MeetingMemberDocument } from './meeting-member.schema';

@Schema({
  versionKey: false,
  collection: 'meetings',
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: { virtuals: true },
})
export class MeetingDocument extends IdentifiableEntitySchema {
  // @Prop()
  // readonly name: string;
  @Prop({ type: SchemaTypes.ObjectId, ref: UserSchema.name, required: true })
  readonly meetingCreatorId: Types.ObjectId;
  @Prop()
  readonly roomCode: string;
  @Prop({ type: Boolean, default: true })
  readonly active: boolean;
}

const MeetingSchema = SchemaFactory.createForClass(MeetingDocument);
MeetingSchema.virtual('activeMembers', {
  ref: MeetingMemberDocument.name,
  localField: '_id',
  foreignField: 'meetingId',
  justOne: false,
  match: {
    isActive: true,
  },
});
//
// MeetingSchema.virtual('Members', {
//   ref: MeetingMemberSchema.name,
//   localField: 'activeMembers',
//   foreignField: '_id',
//   justOne: false,
//   match: {
//     isActive: true,
//   },
// });

export { MeetingSchema };
