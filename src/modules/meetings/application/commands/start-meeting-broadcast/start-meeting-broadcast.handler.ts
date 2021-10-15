import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StartMeetingBroadcastCommand } from './start-meeting-broadcast.command';
import { ErrorMessage } from '../../../domain/error.enum';
import { Meeting } from '../../../domain/aggregates/meeting.aggregate';
import { MeetingEntityRepository } from '../../../infrastructure/repositories/meeting-entity.repository';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MeetingGateway } from '../../../interfaces/socket/meeting.gateway';

@CommandHandler(StartMeetingBroadcastCommand)
export class StartMeetingBroadcastHandler
  implements ICommandHandler<StartMeetingBroadcastCommand>
{
  constructor(
    private readonly meetingEntityRepository: MeetingEntityRepository,
    private readonly wssGateway: MeetingGateway,
  ) {}
  async execute({
    meetingBroadcastRequest,
  }: StartMeetingBroadcastCommand): Promise<Meeting> {
    const meetingOrError = await this.meetingEntityRepository.findOneAttr({
      _id: meetingBroadcastRequest.meetingId,
      isActive: true,
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

    meeting.isBroadcasting = true;
    await this.meetingEntityRepository.findOneAndReplaceById(
      meeting.id,
      meeting,
    );

    meeting.commit();
    this.wssGateway.wss
      .to(meeting.id)
      .emit('startBroadcastingSession', meeting.isBroadcasting);
    return meeting;
  }
}
