import { MeetingBroadcastRequestDto } from '../../../interfaces/dtos/request/meeting-broadcast-request.dto';

export class EndMeetingBroadcastCommand {
  constructor(
    public readonly meetingBroadcastRequest: MeetingBroadcastRequestDto,
  ) {}
}
