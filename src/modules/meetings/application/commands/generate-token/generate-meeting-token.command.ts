import { TokenMeetingRequest } from '../../../interfaces/dtos/request/token-meeting-request.dto';

export class GenerateMeetingTokenCommand {
  constructor(public readonly tokenMeetingRequest: TokenMeetingRequest) {}
}
