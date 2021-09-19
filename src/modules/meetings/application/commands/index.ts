import { CreateMeetingHandler } from './create-meeting/create-meeting.handler';
import { GenerateMeetingTokenHandler } from './generate-token/generate-meeting-token.handler';
import { AddMeetingMemberHandler } from './add-participant/add-meeting-member.handler';
import { RemoveMeetingParticipantHandler } from './remove-member/remove-meeting-participant.handler';
import { DeleteMeetingHandler } from './delete-meeting/delete-meeting.handler';
import { UpdateMeetingMemberHandler } from './update-member/update-meeting-member.handler';

export const MeetingCommandHandlers = [
  CreateMeetingHandler,
  GenerateMeetingTokenHandler,
  AddMeetingMemberHandler,
  RemoveMeetingParticipantHandler,
  DeleteMeetingHandler,
  UpdateMeetingMemberHandler,
];
