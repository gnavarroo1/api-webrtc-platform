import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { AddMeetingMemberCommand } from './add-meeting-member.command';
import { JwtService } from '@nestjs/jwt';
import { MeetingEntityRepository } from '../../../infrastructure/repositories/meeting-entity.repository';
import { ErrorMessage } from '../../../domain/error.enum';
import { MeetingMemberFactory } from '../../../domain/meeting-member.factory';
import { MeetingMemberEntityRepository } from '../../../infrastructure/repositories/meeting-member-entity.repository';
import { MeetingMember } from '../../../domain/aggregates/meeting-member.aggregate';
import { Result } from '../../../../../shared/utils/functional-error-handler';

@CommandHandler(AddMeetingMemberCommand)
export class AddMeetingMemberHandler
  implements ICommandHandler<AddMeetingMemberCommand>
{
  constructor(
    private readonly meetingEntityRepository: MeetingEntityRepository,
    private readonly meetingMemberEntityRepository: MeetingMemberEntityRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly jwtService: JwtService,
    private readonly meetingMemberFactory: MeetingMemberFactory,
  ) {}

  async execute({
    addMeetingMemberRequest,
    socketId,
  }: AddMeetingMemberCommand): Promise<Result<MeetingMember>> {
    console.log(
      'AddMeetingMemberHandler',
      'Validando que la meeting existe y esta activa',
    );

    //region TODO ENCAPSULATE VALIDATION
    const meetingOrError = await this.meetingEntityRepository.findOneAttr({
      _id: addMeetingMemberRequest.meetingId,
      active: true,
    });

    if (meetingOrError.isFailure) {
      return Result.fail<MeetingMember>(ErrorMessage.MEETINGS_IS_NOT_FOUND);
    }
    //endregion

    console.log(
      'AddMeetingMemberHandler',
      'Buscando si es que existe un miembro ya registrado con el id de usuario y meeting recibido',
    );
    const meetingMemberOrError =
      await this.meetingMemberEntityRepository.findOneAttr({
        userId: addMeetingMemberRequest.userId,
        meetingId: addMeetingMemberRequest.meetingId,
      });
    // console.log('AddMeetingMemberHandler', meetingMemberOrError);
    let meetingMember;
    if (meetingMemberOrError.isSuccess) {
      console.log(
        'AddMeetingMemberHandler',
        'Si es que el miembro existe, entonces se valida si es que su atributo isActive es verdadero',
      );
      meetingMember = meetingMemberOrError.getValue();
      if (!meetingMember.isActive) {
        meetingMember.isActive = true;
        meetingMember.socketId = socketId;
        await this.meetingMemberEntityRepository.findOneAndReplaceByAttr(
          {
            _id: meetingMember.id,
          },
          meetingMember,
        );
      } else {
        //TODO maybe throw Conflict error?
        Result.fail<MeetingMember>(ErrorMessage.CREDENTIALS_ERROR);
      }
    } else {
      meetingMember = this.eventPublisher.mergeObjectContext(
        await this.meetingMemberFactory.create(
          addMeetingMemberRequest.userId,
          addMeetingMemberRequest.meetingId,
          socketId,
          addMeetingMemberRequest.nickname,
          addMeetingMemberRequest.memberType,
        ),
      );
    }
    meetingMember.commit();
    return Result.ok<MeetingMember>(meetingMember);
    // const user: MeetingMemberDto = {
    //   userType: addMeetingMemberRequest.userType,
    //   _id: new ObjectId(addMeetingMemberRequest.id),
    //   socketId: socketId,
    //   hasVideo: true,
    //   hasAudio: true,
    //   nickname: addMeetingMemberRequest.nickname
    //     ? addMeetingMemberRequest.nickname
    //     : addMeetingMemberRequest.id,
    //   active: true,
    // };
    //
    //
    // console.log('member', user);
    // meeting.addParticipant(user);
    // await this.meetingEntityRepository.findOneAndReplaceByAttr(
    //   { _id: addMeetingMemberRequest.meetingId, active: true },
    //   meeting,
    // );
    //
    // meeting.commit();
    //
    // console.log('here');
    // return {
    //   // participants: meeting.getParticipants(),
    //   isMeetingCreator: meeting.getMeetingCreatorId() === decoded.sub,
    //   hasAudio: true,
    //   hasVideo: true,
    //   nickname: addMeetingMemberRequest.nickname,
    //   userType: 'PARTICIPANT',
    // };
  }
}
