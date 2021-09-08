import { CreateMeetingHandler } from './create-meeting/create-meeting.handler';
import { GenerateMeetingTokenHandler } from './generate-token/generate-meeting-token.handler';
import { AddMeetingParticipantHandler } from './add-participant/add-meeting-participant.handler';
import { RemoveMeetingParticipantHandler } from './remove-participant/remove-meeting-participant.handler';
import { DeleteMeetingHandler } from './delete-meeting/delete-meeting.handler';
import { UpdateMeetingParticipantHandler } from './update-participants/update-meeting-participant.handler';
export const MeetingCommandHandlers = [
  CreateMeetingHandler,
  GenerateMeetingTokenHandler,
  AddMeetingParticipantHandler,
  RemoveMeetingParticipantHandler,
  DeleteMeetingHandler,
  UpdateMeetingParticipantHandler,
];
