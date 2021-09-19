import { RemoveMeetingParticipantRequest } from '../../../interfaces/dtos/request/remove-meeting-participant-request.dto';
export class RemoveMeetingParticipantCommand {
  constructor(
    public readonly removeMeetingParticipantRequest: RemoveMeetingParticipantRequest,
  ) {}
}
