import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { EndMeetingBroadcastCommand } from './end-meeting-broadcast.command';
import { ErrorMessage } from '../../../domain/error.enum';
import { Meeting } from '../../../domain/aggregates/meeting.aggregate';
import { MeetingEntityRepository } from '../../../infrastructure/repositories/meeting-entity.repository';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MeetingGateway } from '../../../interfaces/socket/meeting.gateway';

@CommandHandler(EndMeetingBroadcastCommand)
export class EndMeetingBroadcastHandler
  implements ICommandHandler<EndMeetingBroadcastCommand>
{
  constructor(
    private readonly meetingEntityRepository: MeetingEntityRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly wss: MeetingGateway,
  ) {}
  async execute({
    meetingBroadcastRequest,
  }: EndMeetingBroadcastCommand): Promise<Meeting> {
    const meetingOrError = await this.meetingEntityRepository.findOneAttr({
      _id: meetingBroadcastRequest.meetingId,
      isActive: true,
      isBroadcasting: true,
    });

    if (meetingOrError.isFailure) {
      throw new HttpException(
        ErrorMessage.MEETINGS_IS_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    const meeting: Meeting = meetingOrError.getValue();

    if (
      meetingBroadcastRequest.sessionUserId !== meeting.meetingCreatorId &&
      meetingBroadcastRequest.userId !== meeting.meetingCreatorId
    ) {
      throw new HttpException(
        ErrorMessage.CREDENTIALS_ERROR,
        HttpStatus.UNAUTHORIZED,
      );
    }
    meeting.isBroadcasting = false;

    await this.meetingEntityRepository.findOneAndReplaceById(
      meeting.id,
      meeting,
    );

    this.wss.wss
      .to(meeting.id)
      .emit('endBroadcastingSession', meeting.isBroadcasting);

    meeting.commit();
    return meeting;
  }
}
