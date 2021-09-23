import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateMeetingMemberCommand } from './update-meeting-member.command';
import { MeetingEntityRepository } from '../../../infrastructure/repositories/meeting-entity.repository';
import { Result } from '../../../../../shared/utils/functional-error-handler';
import { Meeting } from '../../../domain/aggregates/meeting.aggregate';
import { ErrorMessage } from '../../../domain/error.enum';
import { MeetingMemberEntityRepository } from '../../../infrastructure/repositories/meeting-member-entity.repository';
import { ObjectId } from 'mongodb';

@CommandHandler(UpdateMeetingMemberCommand)
export class UpdateMeetingMemberHandler
  implements ICommandHandler<UpdateMeetingMemberCommand>
{
  constructor(
    private readonly meetingEntityRepository: MeetingEntityRepository,
    private readonly meetingMemberEntityRepository: MeetingMemberEntityRepository,
  ) {}

  async execute({
    updateMeetingMemberRequest,
    socketId,
  }: UpdateMeetingMemberCommand): Promise<any> {
    const meetingOrError = await this.meetingEntityRepository.findOneAttr({
      _id: updateMeetingMemberRequest.meetingId,
      isActive: true,
    });
    if (meetingOrError.isFailure) {
      return Result.fail<Meeting>(ErrorMessage.MEETINGS_IS_NOT_FOUND);
    }

    const meetingMemberOrError =
      await this.meetingMemberEntityRepository.findOneAttr({
        _id: updateMeetingMemberRequest.meetingMemberId,
        isActive: true,
      });

    if (meetingMemberOrError.isFailure) {
      return Result.fail<Meeting>(ErrorMessage.MEETING_MEMBER_NOT_FOUND);
    }
    const meetingMember = meetingMemberOrError.getValue();
    const { meetingId, meetingMemberId, ...properties } =
      updateMeetingMemberRequest;

    if (properties.memberType !== undefined) {
      meetingMember.memberType = properties.memberType;
    }
    if (properties.nickname !== undefined) {
      meetingMember.nickname = properties.nickname;
    }
    if (properties.produceAudioAllowed !== undefined) {
      meetingMember.produceAudioAllowed = properties.produceAudioAllowed;
    }
    if (properties.produceAudioEnabled !== undefined) {
      meetingMember.produceAudioEnabled = properties.produceAudioEnabled;
    }
    if (properties.produceVideoAllowed !== undefined) {
      meetingMember.produceVideoAllowed = properties.produceVideoAllowed;
    }
    if (properties.produceVideoEnabled !== undefined) {
      meetingMember.produceVideoEnabled = properties.produceVideoEnabled;
    }
    await this.meetingMemberEntityRepository.findOneAndReplaceByAttr(
      {
        _id: new ObjectId(meetingMember.id),
      },
      meetingMember,
    );
    meetingMember.commit();
    return Result.ok<any>({
      ...properties,
      meetingMemberId: meetingMemberId,
      meetingId: meetingId,
    });
  }
}
