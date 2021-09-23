import { MeetingBroadcastRequestDto } from '../../../interfaces/dtos/request/meeting-broadcast-request.dto';

export class StartMeetingBroadcastCommand {
  constructor(
    public readonly meetingBroadcastRequest: MeetingBroadcastRequestDto,
  ) {}
}
