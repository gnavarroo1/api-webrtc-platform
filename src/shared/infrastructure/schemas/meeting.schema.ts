import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IdentifiableEntitySchema } from '../../generics/identifiable-entity.schema';
import { SchemaTypes, Types } from 'mongoose';
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
  @Prop({ type: SchemaTypes.ObjectId, required: true })
  readonly meetingCreatorId: Types.ObjectId;
  @Prop({ type: Boolean, default: false })
  readonly isBroadcasting: boolean;
  @Prop({ type: Boolean, default: true })
  readonly isActive: boolean;
}

const MeetingSchema = SchemaFactory.createForClass(MeetingDocument);
MeetingSchema.virtual('activeMembers', {
  ref: MeetingMemberDocument.name,
  localField: '_id',
  foreignField: 'meetingId',
  justOne: false,
  match: {
    $or: [
      {
        memberType: 'PRODUCER',
        isActive: true,
      },
      {
        memberType: 'BOTH',
        isActive: true,
      },
    ],
  },
});
MeetingSchema.virtual('activeOnlyConsumerMembers', {
  ref: MeetingMemberDocument.name,
  localField: '_id',
  foreignField: 'meetingId',
  justOne: false,
  match: {
    memberType: 'CONSUMER',
    isActive: true,
  },
});

MeetingSchema.virtual('activeProducerMembersScreenSharing', {
  ref: MeetingMemberDocument.name,
  localField: '_id',
  foreignField: 'meetingId',
  justOne: false,
  match: {
    $or: [
      {
        memberType: 'PRODUCER',
        isScreenSharing: true,
        isActive: true,
      },
      {
        memberType: 'BOTH',
        isScreenSharing: true,
        isActive: true,
      },
    ],
  },
});

export { MeetingSchema };
