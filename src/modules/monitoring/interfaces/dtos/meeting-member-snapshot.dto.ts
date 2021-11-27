import {
  P2PStatsSnapshot,
  SfuStatsSnapshot,
} from '../../../../shared/types/common.types';
import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';

export class MeetingMemberSnapshotDto {
  @ApiModelProperty()
  readonly meetingId: string;
  @ApiModelProperty()
  readonly meetingMemberId: string;
  @ApiModelProperty()
  readonly p2pSnapshots: Record<string, P2PStatsSnapshot>;
  @ApiModelProperty()
  readonly sfuSnapshots: SfuStatsSnapshot;
  @ApiModelProperty()
  readonly timestamp: number;
  @ApiModelProperty()
  readonly activeSFUConnections: number;
  @ApiModelProperty()
  readonly activeP2PConnections: number;
}
