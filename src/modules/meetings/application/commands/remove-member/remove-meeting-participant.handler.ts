import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { RemoveMeetingParticipantCommand } from './remove-meeting-participant.command';
import { JwtService } from '@nestjs/jwt';
import { MeetingEntityRepository } from '../../../infrastructure/repositories/meeting-entity.repository';
import { Result } from '../../../../../shared/utils/functional-error-handler';
import { ErrorMessage } from '../../../domain/error.enum';
import { MeetingMemberEntityRepository } from '../../../infrastructure/repositories/meeting-member-entity.repository';

@CommandHandler(RemoveMeetingParticipantCommand)
export class RemoveMeetingParticipantHandler
  implements ICommandHandler<RemoveMeetingParticipantCommand>
{
  constructor(
    private readonly meetingEntityRepository: MeetingEntityRepository,
    private readonly meetingMemberEntityRepository: MeetingMemberEntityRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly jwtService: JwtService,
  ) {}

  async execute({
    removeMeetingParticipantRequest,
  }: RemoveMeetingParticipantCommand): Promise<Result<any>> {
    //region TODO ENCAPSULATE VALIDATION
    return this.jwtService
      .verifyAsync(removeMeetingParticipantRequest.userToken)
      .then(async (verify) => {
        const meetingMemberOrError =
          await this.meetingMemberEntityRepository.findOneAttr({
            socketId: removeMeetingParticipantRequest.socketId,
            isActive: true,
          });
        if (meetingMemberOrError.isFailure) {
          return Result.fail<any>('NOT FOUND');
        }
        const meetingMember = meetingMemberOrError.getValue();
        meetingMember.isActive = false;
        await this.meetingMemberEntityRepository.findOneAndReplaceById(
          meetingMember.id,
          meetingMember,
        );
        return Result.ok<any>(meetingMember);
      })
      .catch((e) => {
        return Result.fail<any>(ErrorMessage.CREDENTIALS_ERROR);
      });

    //
    // const meeting = await this.meetingEntityRepository.findOneAttr({
    //   _id: removeMeetingParticipantRequest.meetingId,
    //   active: true,
    // });
    // // console.log(meeting);
    // const participants = meeting.getParticipants();
    //
    // if (
    //   decoded.sub !== removeMeetingParticipantRequest.participantId &&
    //   decoded.sub !== meeting.getMeetingCreatorId()
    // ) {
    //   throw new HttpException(
    //     ErrorMessage.CREDENTIALS_ERROR,
    //     HttpStatus.UNAUTHORIZED,
    //   );
    // }
    // if (participants.length === 0) {
    //   throw new HttpException(
    //     'EL PARTICIPANTE INGRESADO NO SE ENCUENTRA EN REGISTRADO EN LA MEETING',
    //     HttpStatus.NOT_FOUND,
    //   );
    // }
    // const pIndex = participants.findIndex(
    //   (element) => element._id === decoded.sub,
    // );
    // if (pIndex === -1) {
    //   throw new HttpException(
    //     'EL PARTICIPANTE INGRESADO NO SE ENCUENTRA EN REGISTRADO EN LA MEETING',
    //     HttpStatus.NOT_FOUND,
    //   );
    // }
    // meeting.deleteParticipant(decoded.sub);
    // await this.meetingEntityRepository.findOneAndReplaceByAttr(
    //   { _id: removeMeetingParticipantRequest.meetingId, active: true },
    //   meeting,
    // );
    // meeting.commit();
  }
}
