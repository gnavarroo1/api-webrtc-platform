import { AggregateRoot } from '@nestjs/cqrs';
import {
  P2POutboundStats,
  SfuProducerStats,
} from '../../../../shared/types/common.types';

export class MemberSnapshotAggregate extends AggregateRoot {
  constructor(
    private readonly _id: string,
    private data: {
      _meetingMemberId: string;
      _sfuStatsVideo: SfuProducerStats[];
      _sfuStatsAudio: SfuProducerStats[];
      _meshOutboundVideoStats: P2POutboundStats;
      _meshOutboundAudioStats: P2POutboundStats;
    },
  ) {
    super();
  }
}
