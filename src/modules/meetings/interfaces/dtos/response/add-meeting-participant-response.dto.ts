export class AddMeetingParticipantResponse {
  readonly produceVideoEnabled: boolean;
  readonly produceAudioEnabled: boolean;
  readonly produceVideoAllowed: boolean;
  readonly produceAudioAllowed: boolean;
  readonly connectionType: string;
  readonly canScreenShare: boolean;
  readonly meetingId: string;
  readonly _id: string;
  readonly sessionUserId: string;
  readonly userId: string;
  readonly nickname: string;
  readonly memberType: string;
  readonly isMeetingCreator: boolean;
}
