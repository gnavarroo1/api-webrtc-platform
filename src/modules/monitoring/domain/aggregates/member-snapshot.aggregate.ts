import { AggregateRoot } from '@nestjs/cqrs';
import {
  P2PStatsSnapshot,
  SfuStatsSnapshot,
} from '../../../../shared/types/common.types';

export class MeetingMemberSnapshot extends AggregateRoot {
  constructor(
    private readonly _id: string,
    private _meetingId: string,
    private _meetingMemberId: string,
    private _p2pSnapshots: Map<string, P2PStatsSnapshot>,
    private _sfuSnapshots: SfuStatsSnapshot,
    private _activeP2PConnections: number,
    private _activeSFUConnections: number,
    private _timestamp: number,
  ) {
    super();
  }

  get activeP2PConnections(): number {
    return this._activeP2PConnections;
  }

  set activeP2PConnections(value: number) {
    this._activeP2PConnections = value;
  }

  get activeSFUConnections(): number {
    return this._activeSFUConnections;
  }

  set activeSFUConnections(value: number) {
    this._activeSFUConnections = value;
  }

  get timestamp(): number {
    return this._timestamp;
  }

  set timestamp(value: number) {
    this._timestamp = value;
  }

  get id(): string {
    return this._id;
  }

  get meetingId(): string {
    return this._meetingId;
  }
  set meetingId(value: string) {
    this._meetingId = value;
  }
  get meetingMemberId(): string {
    return this._meetingMemberId;
  }

  set meetingMemberId(value: string) {
    this._meetingMemberId = value;
  }

  get p2pSnapshots(): Map<string, P2PStatsSnapshot> {
    return this._p2pSnapshots;
  }

  set p2pSnapshots(value: Map<string, P2PStatsSnapshot>) {
    this._p2pSnapshots = value;
  }

  get sfuSnapshots(): SfuStatsSnapshot {
    return this._sfuSnapshots;
  }

  set sfuSnapshots(value: SfuStatsSnapshot) {
    this._sfuSnapshots = value;
  }
}
