import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IdentifiableEntitySchema } from '../../generics/identifiable-entity.schema';
import { SchemaTypes, Types } from 'mongoose';
import { P2PStatsSnapshot, SfuStatsSnapshot } from '../../types/common.types';

@Schema({
  versionKey: false,
  collection: 'meetingmemberssnapshot',
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: { virtuals: true },
})
export class MeetingMemberSnapshotDocument extends IdentifiableEntitySchema {
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'meetings',
    required: true,
  })
  readonly meetingId: Types.ObjectId;
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'meetingmembers',
    required: true,
  })
  readonly meetingMemberId: Types.ObjectId;
  @Prop({
    type: Map,
    of: Object,
  })
  readonly p2pSnapshots: Map<string, P2PStatsSnapshot>;
  @Prop({
    type: Object,
  })
  readonly sfuSnapshots: SfuStatsSnapshot;

  @Prop({
    type: Number,
  })
  readonly activeP2PConnections: number;
  @Prop({
    type: Number,
  })
  readonly timestamp: number;

  @Prop({
    type: Number,
  })
  readonly activeSFUConnections: number;
}
const MeetingMemberSnapshotSchema = SchemaFactory.createForClass(
  MeetingMemberSnapshotDocument,
);

export { MeetingMemberSnapshotSchema };
