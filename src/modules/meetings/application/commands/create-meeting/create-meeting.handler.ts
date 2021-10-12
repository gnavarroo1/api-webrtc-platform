import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { MeetingFactory } from '../../../domain/meeting.factory';
import { CreateMeetingCommand } from './create-meeting.command';
import { CreateMeetingResponse } from '../../../interfaces/dtos/response/create-meeting-response.dto';

@CommandHandler(CreateMeetingCommand)
export class CreateMeetingHandler
  implements ICommandHandler<CreateMeetingCommand>
{
  constructor(
    private readonly meetingFactory: MeetingFactory,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({
    createMeetingRequest,
  }: CreateMeetingCommand): Promise<CreateMeetingResponse> {
    const { meetingCreatorId } = createMeetingRequest;
    const meeting = this.eventPublisher.mergeObjectContext(
      await this.meetingFactory.create(meetingCreatorId),
    );
    meeting.commit();

    return {
      _id: meeting.id,
      meetingCreatorId: meeting.meetingCreatorId,
      isActive: meeting.isActive,
      isBroadcasting: meeting.isBroadcasting,
    };
  }
}
