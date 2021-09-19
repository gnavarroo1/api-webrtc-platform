import { UpdateMeetingParticipantRequest } from '../../../interfaces/dtos/request/update-participant-request.dto';

export class UpdateMeetingMemberCommand {
  constructor(
    public readonly updateMeetingParticipantRequest: UpdateMeetingParticipantRequest,
  ) {}
}
