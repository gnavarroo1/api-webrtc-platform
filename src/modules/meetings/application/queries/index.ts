import { GetMeetingHandler } from './get-meeting-info/get-meeting.handler';
import { ListMeetingMembersHandler } from './list-meeting-members/list-meeting-members.handler';

export const MeetingQueryHandlers = [
  GetMeetingHandler,
  ListMeetingMembersHandler,
];
