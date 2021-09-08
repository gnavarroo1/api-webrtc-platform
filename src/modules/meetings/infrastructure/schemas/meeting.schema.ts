import { Prop, Schema } from '@nestjs/mongoose';
import { IdentifiableEntitySchema } from '../../../../shared/identifiable-entity.schema';
import { ObjectId, ObjectID } from 'mongodb';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ versionKey: false, collection: 'meetings' })
export class MeetingSchema extends IdentifiableEntitySchema {
  @Prop()
  readonly name: string;
  @Prop({ type: Date, default: new Date() })
  readonly creationDate: Date;

  @Prop()
  readonly meetingCreatorId: string;
  @Prop()
  readonly roomCode: string;
  @Prop({
    type: [
      {
        _id: { type: String },
        hasAudio: { type: Boolean, default: true },
        hasVideo: { type: Boolean, default: true },
        alias: { type: String },
        userType: {
          type: String,
          default: 'PARTICIPANT',
          enum: ['PARTICIPANT', 'OBSERVER'],
        },
      },
    ],
  })
  readonly participants: {
    _id: string;
    hasAudio: boolean;
    hasVideo: boolean;
    userType: string;
  }[];
  @Prop({ type: Boolean, default: true })
  readonly active: boolean;
}
