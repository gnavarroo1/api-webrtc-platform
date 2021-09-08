import { AddMeetingParticipantRequest } from '../../../interfaces/dtos/request/add-meeting-participant-request.dto';

export class AddMeetingParticipantCommand {
  constructor(
    public readonly addMeetingParticipantRequest: AddMeetingParticipantRequest,
    public readonly socketId: string,
  ) {}
}
