import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IdentifiableEntitySchema } from '../../generics/identifiable-entity.schema';
import { SchemaTypes, Types } from 'mongoose';
import { ObjectID } from 'mongodb';

@Schema({ versionKey: false, collection: 'meetingmembers', timestamps: true })
export class MeetingMemberDocument extends IdentifiableEntitySchema {
  @Prop({
    type: ObjectID,
  })
  readonly userId: Types.ObjectId;
  @Prop({
    type: ObjectID,
    required: true,
  })
  readonly sessionUserId: Types.ObjectId;
  @Prop({
    type: SchemaTypes.ObjectId,
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
  @Prop({
    type: String,
    enum: ['MESH', 'SFU'],
  })
  readonly connectionType: string;
  @Prop({ type: String, required: true })
  readonly socketId: string;
  @Prop({ type: Boolean, default: true })
  readonly isActive: boolean;
  @Prop({ type: Boolean, default: true })
  readonly produceAudioAllowed: boolean;
  @Prop({ type: Boolean, default: true })
  readonly produceVideoAllowed: boolean;
  @Prop({ type: Boolean, default: true })
  readonly produceAudioEnabled: boolean;
  @Prop({ type: Boolean, default: true })
  readonly produceVideoEnabled: boolean;
  @Prop({
    type: Boolean,
    default: false,
  })
  readonly isScreenSharing: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  readonly canScreenShare: boolean;
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
