import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateMeetingParticipantCommand } from './update-meeting-participant.command';
import { UpdateMeetingParticipantRequest } from '../../../interfaces/dtos/request/update-participant-request.dto';
import { UserDto } from '../../../interfaces/dtos/user.dto';
import { MeetingEntityRepository } from '../../../infrastructure/repositories/meeting-entity.repository';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { ErrorMessage } from '../../../domain/error.enum';

@CommandHandler(UpdateMeetingParticipantCommand)
export class UpdateMeetingParticipantHandler
  implements ICommandHandler<UpdateMeetingParticipantCommand>
{
  constructor(
    private readonly meetingEntityRepository: MeetingEntityRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly jwtService: JwtService,
  ) {}

  async execute({
    updateMeetingParticipantRequest,
  }: UpdateMeetingParticipantCommand): Promise<any> {
    const decoded = this.jwtService.decode(
      updateMeetingParticipantRequest.token,
    );
    if (decoded.sub !== updateMeetingParticipantRequest.participantId) {
      throw new HttpException(
        ErrorMessage.CREDENTIALS_ERROR,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const meeting = await this.meetingEntityRepository.findOneAttr({
      _id: updateMeetingParticipantRequest.meetingId,
      active: true,
    });

    if (!meeting) {
      throw new HttpException(
        ErrorMessage.MEETINGS_IS_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    const participants = meeting.getParticipants();
    if (participants.length === 0) {
      throw new HttpException(
        'EL PARTICIPANTE INGRESADO NO SE ENCUENTRA EN REGISTRADO EN LA MEETING',
        HttpStatus.NOT_FOUND,
      );
    }
    const pIndex = participants.findIndex(
      (element) => element._id === decoded.sub,
    );
    if (pIndex === -1) {
      throw new HttpException(
        'EL PARTICIPANTE INGRESADO NO SE ENCUENTRA EN REGISTRADO EN LA MEETING',
        HttpStatus.NOT_FOUND,
      );
    }
    const newParticipant = {
      ...participants[pIndex],
      alias: updateMeetingParticipantRequest.alias,
    };
    meeting.updateParticipant(newParticipant, pIndex);
    await this.meetingEntityRepository.findOneAndReplaceByAttr(
      { _id: updateMeetingParticipantRequest.meetingId, active: true },
      meeting,
    );
    meeting.commit();
    return meeting.getParticipant(newParticipant._id);
  }
}
