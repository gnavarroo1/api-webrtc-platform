import { RemoveMeetingMemberRequest } from '../../../interfaces/dtos/request/remove-meeting-member-request.dto';

export class RemoveMeetingMemberCommand {
  constructor(
    public readonly removeMeetingMemberRequest: RemoveMeetingMemberRequest,
  ) {}
}
