import { DeleteMeetingRequest } from '../../../interfaces/dtos/request/delete-meeting-request.dto';

export class DeleteMeetingCommand {
  constructor(public readonly deleteMeetingRequest: DeleteMeetingRequest) {}
}
