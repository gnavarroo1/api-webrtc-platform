import { AggregateRoot } from '@nestjs/cqrs';

export class MeetingMember extends AggregateRoot {
  constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _meetingId: string,
    private _socketId: string,
    private _nickname: string,
    private _memberType: string,
    private _isActive: boolean,
  ) {
    super();
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get meetingId(): string {
    return this._meetingId;
  }

  get socketId(): string {
    return this._socketId;
  }

  set socketId(value: string) {
    this._socketId = value;
  }

  get nickname(): string {
    return this._nickname;
  }

  set nickname(value: string) {
    this._nickname = value;
  }

  get memberType(): string {
    return this._memberType;
  }

  set memberType(value: string) {
    this._memberType = value;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  set isActive(value: boolean) {
    this._isActive = value;
  }
}
