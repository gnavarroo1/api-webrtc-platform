import { CreateMeetingHandler } from './create-meeting/create-meeting.handler';
import { GenerateMeetingTokenHandler } from './generate-token/generate-meeting-token.handler';
import { AddMeetingMemberHandler } from './add-meeting-member/add-meeting-member.handler';
import { RemoveMeetingMemberHandler } from './remove-meeting-member/remove-meeting-member.handler';
import { DeleteMeetingHandler } from './delete-meeting/delete-meeting.handler';
import { UpdateMeetingMemberHandler } from './update-meeting-member/update-meeting-member.handler';
import { StartMeetingBroadcastHandler } from './start-meeting-broadcast/start-meeting-broadcast.handler';
import { EndMeetingBroadcastHandler } from './end-meeting-broadcast/end-meeting-broadcast.handler';

export const MeetingCommandHandlers = [
  GenerateMeetingTokenHandler,
  CreateMeetingHandler,
  DeleteMeetingHandler,
  StartMeetingBroadcastHandler,
  EndMeetingBroadcastHandler,
  AddMeetingMemberHandler,
  UpdateMeetingMemberHandler,
  RemoveMeetingMemberHandler,
];
