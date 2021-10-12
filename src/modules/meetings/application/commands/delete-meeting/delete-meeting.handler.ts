import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { DeleteMeetingCommand } from './delete-meeting.command';
import { JwtService } from '@nestjs/jwt';
import { MeetingEntityRepository } from '../../../infrastructure/repositories/meeting-entity.repository';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorMessage } from '../../../domain/error.enum';
import { Meeting } from '../../../domain/aggregates/meeting.aggregate';

@CommandHandler(DeleteMeetingCommand)
export class DeleteMeetingHandler
  implements ICommandHandler<DeleteMeetingCommand>
{
  constructor(
    private readonly meetingEntityRepository: MeetingEntityRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly jwtService: JwtService,
  ) {}

  async execute({ deleteMeetingRequest }: DeleteMeetingCommand): Promise<void> {
    const decoded = this.jwtService.decode(deleteMeetingRequest.userToken);
    const meetingOrFailure = await this.meetingEntityRepository.findOneAttr({
      _id: deleteMeetingRequest.meetingId,
    });
    if (!meetingOrFailure.isFailure) {
      throw new HttpException(
        ErrorMessage.MEETINGS_IS_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    const meeting: Meeting = meetingOrFailure.getValue();
    meeting.isActive = false;

    const t = await this.meetingEntityRepository.findOneAndReplaceById(
      deleteMeetingRequest.meetingId,
      meeting,
    );
    meeting.commit();
    return;
  }
}
