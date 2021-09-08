export class AddMeetingParticipantRequest {
  readonly meetingId: string;
  readonly id: string;
  readonly alias?: string;
  readonly userType?: string;
  usertoken?: string;
}
