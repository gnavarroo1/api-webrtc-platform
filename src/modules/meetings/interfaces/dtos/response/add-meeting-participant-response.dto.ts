export class AddMeetingParticipantResponse {
  // readonly participants: MeetingMemberDto[];
  readonly nickname: string;
  readonly isMeetingCreator: boolean;
  readonly hasAudio: boolean;
  readonly hasVideo: boolean;
  readonly userType: string;
}
