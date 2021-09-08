import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { AddMeetingParticipantCommand } from './add-meeting-participant.command';
import { AddMeetingParticipantResponse } from '../../../interfaces/dtos/response/add-meeting-participant-response.dto';
import { UserDto } from '../../../interfaces/dtos/user.dto';
import { JwtService } from '@nestjs/jwt';
import { MeetingEntityRepository } from '../../../infrastructure/repositories/meeting-entity.repository';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { ErrorMessage } from '../../../domain/error.enum';

@CommandHandler(AddMeetingParticipantCommand)
export class AddMeetingParticipantHandler
  implements ICommandHandler<AddMeetingParticipantCommand>
{
  constructor(
    private readonly meetingEntityRepository: MeetingEntityRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly jwtService: JwtService,
  ) {}

  async execute({
    addMeetingParticipantRequest,
    socketId,
  }: AddMeetingParticipantCommand): Promise<AddMeetingParticipantResponse> {
    const meeting = await this.meetingEntityRepository.findOneAttr({
      _id: addMeetingParticipantRequest.meetingId,
      active: true,
    });

    if (!meeting) {
      throw new HttpException(
        ErrorMessage.MEETINGS_IS_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    const decoded = this.jwtService.decode(
      addMeetingParticipantRequest.usertoken,
    );
    const user: UserDto = {
      userType: addMeetingParticipantRequest.userType,
      _id: addMeetingParticipantRequest.id,
      socketId: socketId,
      hasVideo: true,
      hasAudio: true,
      alias: addMeetingParticipantRequest.alias
        ? addMeetingParticipantRequest.alias
        : addMeetingParticipantRequest.id,
      active: true,
    };
    meeting.addParticipant(user);
    await this.meetingEntityRepository.findOneAndReplaceByAttr(
      { _id: addMeetingParticipantRequest.meetingId, active: true },
      meeting,
    );
    meeting.commit();
    console.log('here');
    return {
      participants: meeting.getParticipants(),
      isMeetingCreator: meeting.getMeetingCreatorId() === decoded.sub,
      hasAudio: true,
      hasVideo: true,
      alias: addMeetingParticipantRequest.alias,
      userType: 'PARTICIPANT',
    };
  }
}
