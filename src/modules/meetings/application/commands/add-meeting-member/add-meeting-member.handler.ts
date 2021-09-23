import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { AddMeetingMemberCommand } from './add-meeting-member.command';
import { JwtService } from '@nestjs/jwt';
import { MeetingEntityRepository } from '../../../infrastructure/repositories/meeting-entity.repository';
import { ErrorMessage } from '../../../domain/error.enum';
import { MeetingMemberFactory } from '../../../domain/meeting-member.factory';
import { MeetingMemberEntityRepository } from '../../../infrastructure/repositories/meeting-member-entity.repository';
import { MeetingMember } from '../../../domain/aggregates/meeting-member.aggregate';
import { Result } from '../../../../../shared/utils/functional-error-handler';
import { ObjectId } from 'mongodb';

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
      isActive: true,
    });
    // console.warn(meetingOrError);
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
        $and: [
          {
            $or: [
              { userId: new ObjectId(addMeetingMemberRequest.userId) },
              {
                sessionUserId: new ObjectId(
                  addMeetingMemberRequest.sessionUserId,
                ),
              },
            ],
          },
          {
            meetingId: addMeetingMemberRequest.meetingId,
          },
        ],
      });
    // console.log('AddMeetingMemberHandler', meetingMemberOrError);
    let meetingMember: MeetingMember;
    if (meetingMemberOrError.isSuccess) {
      console.log(
        'AddMeetingMemberHandler',
        'Si es que el miembro existe, entonces se valida ',
      );
      meetingMember = meetingMemberOrError.getValue();
      console.warn(meetingMember, 'MEETING MEMBER');
      if (!meetingMember.isActive) {
        console.warn(
          'si es que su atributo isActive es falso este se actualiza',
        );
        meetingMember.isActive = true;
        meetingMember.socketId = socketId;
        await this.meetingMemberEntityRepository.findOneAndReplaceByAttr(
          {
            _id: new ObjectId(meetingMember.id),
          },
          meetingMember,
        );
      } else {
        console.warn(
          'si es que su atributo isActive es verdadero se lanza un mensaje de error',
        );
        //TODO maybe throw Conflict error?
        return Result.fail<MeetingMember>(ErrorMessage.USER_CONNECTED);
      }
    } else {
      console.log(
        'AddMeetingMemberHandler',
        'Si es que el miembro no existe, entonces se le agrega al documento',
      );
      meetingMember = this.eventPublisher.mergeObjectContext(
        await this.meetingMemberFactory.create(
          addMeetingMemberRequest.userId,
          addMeetingMemberRequest.sessionUserId,
          addMeetingMemberRequest.meetingId,
          socketId,
          addMeetingMemberRequest.nickname,
          addMeetingMemberRequest.memberType,
        ),
      );
    }
    meetingMember.commit();
    return Result.ok<MeetingMember>(meetingMember);
  }
}
