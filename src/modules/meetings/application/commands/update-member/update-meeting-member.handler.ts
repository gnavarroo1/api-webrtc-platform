import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateMeetingMemberCommand } from './update-meeting-member.command';
import { MeetingEntityRepository } from '../../../infrastructure/repositories/meeting-entity.repository';
import { JwtService } from '@nestjs/jwt';

@CommandHandler(UpdateMeetingMemberCommand)
export class UpdateMeetingMemberHandler
  implements ICommandHandler<UpdateMeetingMemberCommand>
{
  constructor(
    private readonly meetingEntityRepository: MeetingEntityRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly jwtService: JwtService,
  ) {}

  async execute({
    updateMeetingParticipantRequest,
  }: UpdateMeetingMemberCommand): Promise<any> {
    // const decoded = this.jwtService.decode(
    //   updateMeetingParticipantRequest.token,
    // );
    // if (decoded.sub !== updateMeetingParticipantRequest.participantId) {
    //   throw new HttpException(
    //     ErrorMessage.CREDENTIALS_ERROR,
    //     HttpStatus.UNAUTHORIZED,
    //   );
    // }
    //
    // const meeting = await this.meetingEntityRepository.findOneAttr({
    //   _id: updateMeetingParticipantRequest.meetingId,
    //   active: true,
    // });
    //
    // if (!meeting) {
    //   throw new HttpException(
    //     ErrorMessage.MEETINGS_IS_NOT_FOUND,
    //     HttpStatus.NOT_FOUND,
    //   );
    // }
    // // const participants = meeting.getParticipants();
    // // if (participants.length === 0) {
    // //   throw new HttpException(
    // //     'EL PARTICIPANTE INGRESADO NO SE ENCUENTRA EN REGISTRADO EN LA MEETING',
    // //     HttpStatus.NOT_FOUND,
    // //   );
    // // }
    // // const pIndex = participants.findIndex(
    // //   (element) => element._id === decoded.sub,
    // // );
    // // if (pIndex === -1) {
    // //   throw new HttpException(
    // //     'EL PARTICIPANTE INGRESADO NO SE ENCUENTRA EN REGISTRADO EN LA MEETING',
    // //     HttpStatus.NOT_FOUND,
    // //   );
    // // }
    // // const newParticipant = {
    // //   ...participants[pIndex],
    // //   nickname: updateMeetingParticipantRequest.nickname,
    // // };
    // // meeting.updateParticipant(newParticipant, pIndex);
    // await this.meetingEntityRepository.findOneAndReplaceByAttr(
    //   { _id: updateMeetingParticipantRequest.meetingId, active: true },
    //   meeting,
    // );
    // meeting.commit();
    // return meeting.getParticipant(newParticipant._id);
  }
}
