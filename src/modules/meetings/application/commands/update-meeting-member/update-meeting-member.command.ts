import { UpdateMeetingMemberRequest } from '../../../interfaces/dtos/request/update-meeting-member-request.dto';

export class UpdateMeetingMemberCommand {
  constructor(
    public readonly updateMeetingMemberRequest: UpdateMeetingMemberRequest,
  ) {}
}
