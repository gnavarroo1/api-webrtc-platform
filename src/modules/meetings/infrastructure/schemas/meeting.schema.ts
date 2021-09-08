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
        socketId: { type: String },
        userType: {
          type: String,
          default: 'PARTICIPANT',
          enum: ['PARTICIPANT', 'OBSERVER'],
        },
        active: { type: Boolean },
      },
    ],
  })
  readonly participants: {
    _id: string;
    alias: string;
    hasAudio: boolean;
    hasVideo: boolean;
    userType: string;
    socketId: string;
    active: boolean;
  }[];
  @Prop({ type: Boolean, default: true })
  readonly active: boolean;
}
