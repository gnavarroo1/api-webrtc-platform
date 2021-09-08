import { UpdateMeetingParticipantRequest } from '../../../interfaces/dtos/request/update-participant-request.dto';

export class UpdateMeetingParticipantCommand {
  constructor(
    public readonly updateMeetingParticipantRequest: UpdateMeetingParticipantRequest,
  ) {}
}
