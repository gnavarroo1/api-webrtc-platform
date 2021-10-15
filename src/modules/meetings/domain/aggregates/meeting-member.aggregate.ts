import { AggregateRoot } from '@nestjs/cqrs';
import { MediaCapabilities } from '../../../../shared/types/common.types';

export class MeetingMember extends AggregateRoot {
  constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _sessionUserId: string,
    private readonly _meetingId: string,
    private _socketId: string,
    private _nickname: string,
    private _memberType: string,
    private _media: MediaCapabilities,
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

  get sessionUserId(): string {
    return this._sessionUserId;
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
  get produceAudioAllowed(): boolean {
    return this._media._produceAudioAllowed;
  }

  set produceAudioAllowed(value: boolean) {
    this._media._produceAudioAllowed = value;
  }

  get produceVideoAllowed(): boolean {
    return this._media._produceVideoAllowed;
  }

  set produceVideoAllowed(value: boolean) {
    this._media._produceVideoAllowed = value;
  }

  get produceAudioEnabled(): boolean {
    return this._media._produceAudioEnabled;
  }

  set produceAudioEnabled(value: boolean) {
    this._media._produceAudioEnabled = value;
  }

  get produceVideoEnabled(): boolean {
    return this._media._produceVideoEnabled;
  }

  set produceVideoEnabled(value: boolean) {
    this._media._produceVideoEnabled = value;
  }

  set isScreenSharing(value: boolean) {
    this._media._isScreenSharing = value;
  }
  get isScreenSharing(): boolean {
    return this._media._isScreenSharing;
  }
  set canScreenShare(value: boolean) {
    this._media._canScreenShare = value;
  }
  get canScreenShare(): boolean {
    return this._media._canScreenShare;
  }

  get connectionType(): string {
    return this._media._connectionType;
  }
  set connectionType(value: string) {
    this._media._connectionType = value;
  }
}
