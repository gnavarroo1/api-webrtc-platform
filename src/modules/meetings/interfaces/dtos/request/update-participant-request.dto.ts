export class UpdateMeetingParticipantRequest {
  readonly meetingId: string;
  readonly participantId: string;
  nickname: string;
  token: string;
}
