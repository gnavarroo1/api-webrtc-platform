import { CreateMeetingRequest } from '../../../interfaces/dtos/request/create-meeting-request.dto';

export class CreateMeetingCommand {
  constructor(public readonly createMeetingRequest: CreateMeetingRequest) {}
}
