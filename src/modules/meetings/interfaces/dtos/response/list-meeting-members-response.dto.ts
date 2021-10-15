import { MeetingMemberDto } from '../meeting-member.dto';

export type ListMeetingMembersResponse = {
  activeMembers: MeetingMemberDto[];
  activeViewers: MeetingMemberDto[];
};
