import { AggregateRoot } from '@nestjs/cqrs';
import { MeetingBroadcastEvent } from '../../application/events/meeting-broadcast/meeting-broadcast.event';

export class Meeting extends AggregateRoot {
  constructor(
    private readonly _id: string,
    private _meetingCreatorId: string,
    private _isBroadcasting: boolean,
    private _isActive: boolean,
  ) {
    super();
  }

  get isActive(): boolean {
    return this._isActive;
  }
  set isActive(value: boolean) {
    this._isActive = value;
  }
  set meetingCreatorId(value: string) {
    this._meetingCreatorId = value;
  }
  get meetingCreatorId(): string {
    return this._meetingCreatorId;
  }

  get isBroadcasting(): boolean {
    return this._isBroadcasting;
  }
  set isBroadcasting(value: boolean) {
    this._isBroadcasting = value;
  }

  get id(): string {
    return this._id;
  }

  public raiseBroadcastEvent(): void {
    this.apply(new MeetingBroadcastEvent(this.isActive, this.id));
  }
}
