import { Injectable } from '@nestjs/common';
import { EntityFactory } from '../../../shared/generics/entity.factory';
import { MeetingMemberSnapshot } from './aggregates/member-snapshot.aggregate';
import { MeetingMemberSnapshotEntityRepository } from '../infrastructure/repositories/meeting-member-snapshot-entity.repository';
import { ObjectId } from 'mongodb';
import {
  P2PStatsSnapshot,
  SfuStatsSnapshot,
} from '../../../shared/types/common.types';

@Injectable()
export class MeetingMemberSnapshotFactory
  implements EntityFactory<MeetingMemberSnapshot>
{
  constructor(
    private readonly meetingMemberSnapshotEntityRepository: MeetingMemberSnapshotEntityRepository,
  ) {}

  async create(
    meetingId: string,
    meetingMemberId: string,
    p2pSnapshots: Map<string, P2PStatsSnapshot>,
    sfuSnapshots: SfuStatsSnapshot,
    activeP2PConnections: number,
    activeSFUConnections: number,
    timestamp: number,
  ): Promise<MeetingMemberSnapshot> {
    const meetingMemberSnapshot = new MeetingMemberSnapshot(
      new ObjectId().toHexString(),
      meetingId,
      meetingMemberId,
      p2pSnapshots,
      sfuSnapshots,
      activeP2PConnections,
      activeSFUConnections,
      timestamp,
    );
    await this.meetingMemberSnapshotEntityRepository.create(
      meetingMemberSnapshot,
    );
    return meetingMemberSnapshot;
  }
}
