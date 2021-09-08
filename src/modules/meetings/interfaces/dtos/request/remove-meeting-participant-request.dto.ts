export class RemoveMeetingParticipantRequest {
  userToken?: string;
  readonly meetingId: string;
  readonly participantId: string;
}
