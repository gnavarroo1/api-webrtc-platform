import {
  P2PStatsSnapshot,
  SfuStatsSnapshot,
} from '../../../../shared/types/common.types';

export class MeetingMemberSnapshotDto {
  readonly _id?: string;
  readonly meetingId: string;
  readonly meetingMemberId: string;
  readonly p2pSnapshots: {
    id: string;
    p2pStatsSnapshot: P2PStatsSnapshot;
  }[];
  readonly sfuSnapshots: SfuStatsSnapshot;
}
