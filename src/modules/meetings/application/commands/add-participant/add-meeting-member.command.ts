import { AddMeetingMemberRequest } from '../../../interfaces/dtos/request/add-meeting-member-request.dto';

export class AddMeetingMemberCommand {
  constructor(
    public readonly addMeetingMemberRequest: AddMeetingMemberRequest,
    public readonly socketId: string,
  ) {}
}
