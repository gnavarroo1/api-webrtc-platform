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
import { AddMeetingParticipantResponse } from '../../../interfaces/dtos/response/add-meeting-participant-response.dto';

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
  }: AddMeetingMemberCommand): Promise<Result<AddMeetingParticipantResponse>> {
    //Validar que la session o meeting exista y se encuentre en estado activo.
    const meetingOrError = await this.meetingEntityRepository.findOneAttr({
      _id: addMeetingMemberRequest.meetingId,
      isActive: true,
    });
    if (meetingOrError.isFailure) {
      return Result.fail<AddMeetingParticipantResponse>(
        ErrorMessage.MEETINGS_IS_NOT_FOUND,
      );
    }
    const meeting = meetingOrError.getValue();

    // Validar si es que la información enviada, userId o sessionUserId, se encuentran registradas en algun meeting member
    // Se considera que tanto el userId como el sessionUserId no pueden estar asignados a más de un meeting member en la misma sesión
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
    let meetingMember: MeetingMember;

    if (meetingMemberOrError.isSuccess) {
      meetingMember = meetingMemberOrError.getValue();
      //Validar si es que el miembro se encuentra activo.
      if (meetingMember.isActive === false) {
        meetingMember.isActive = true;
        meetingMember.socketId = socketId;
        await this.meetingMemberEntityRepository.findOneAndReplaceByAttr(
          {
            _id: new ObjectId(meetingMember.id),
          },
          meetingMember,
        );
      } else {
        return Result.fail<AddMeetingParticipantResponse>(
          ErrorMessage.USER_CONNECTED,
        );
      }
    } else {
      meetingMember = this.eventPublisher.mergeObjectContext(
        await this.meetingMemberFactory.create(
          addMeetingMemberRequest.userId,
          addMeetingMemberRequest.sessionUserId,
          addMeetingMemberRequest.meetingId,
          socketId,
          addMeetingMemberRequest.nickname,
          addMeetingMemberRequest.memberType,
          {
            _connectionType: addMeetingMemberRequest.connectionType,
            _isScreenSharing: false,
            _produceVideoAllowed: true,
            _produceAudioAllowed: true,
            _produceVideoEnabled: false,
            _produceAudioEnabled: false,
          },
        ),
      );
    }
    meetingMember.commit();
    return Result.ok<AddMeetingParticipantResponse>({
      isMeetingCreator:
        meeting.meetingCreatorId === meetingMember.sessionUserId ||
        meeting.meetingCreatorId === meetingMember.userId,
      memberType: meetingMember.memberType,
      nickname: meetingMember.nickname,
      produceVideoAllowed: meetingMember.produceVideoAllowed,
      produceVideoEnabled: meetingMember.produceVideoEnabled,
      produceAudioAllowed: meetingMember.produceAudioAllowed,
      produceAudioEnabled: meetingMember.produceAudioEnabled,
      connectionType: meetingMember.connectionType,
      userId: meetingMember.userId,
      _id: meetingMember.id,
      sessionUserId: meetingMember.sessionUserId,
    });
  }
}
