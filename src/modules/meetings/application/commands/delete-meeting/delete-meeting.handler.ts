import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { DeleteMeetingCommand } from './delete-meeting.command';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { ErrorMessage } from '../../../domain/error.enum';
import { MeetingEntityRepository } from '../../../infrastructure/repositories/meeting-entity.repository';

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
    const meeting = await this.meetingEntityRepository.findOneAttr({
      _id: deleteMeetingRequest.meetingId,
    });
    if (!meeting) {
      throw new HttpException(
        ErrorMessage.MEETINGS_IS_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    // console.log(decoded)
    if (decoded.sub != meeting.getMeetingCreatorId()) {
      throw new HttpException(
        ErrorMessage.CREDENTIALS_ERROR,
        HttpStatus.UNAUTHORIZED,
      );
    }
    meeting.setActive(false);
    console.log(meeting);
    const t = await this.meetingEntityRepository.findOneAndReplaceById(
      deleteMeetingRequest.meetingId,
      meeting,
    );
    console.log(t);
    meeting.commit();
  }
}
