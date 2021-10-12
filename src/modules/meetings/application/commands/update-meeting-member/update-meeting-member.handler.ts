import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateMeetingMemberCommand } from './update-meeting-member.command';
import { MeetingEntityRepository } from '../../../infrastructure/repositories/meeting-entity.repository';
import { Result } from '../../../../../shared/utils/functional-error-handler';
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
  }: UpdateMeetingMemberCommand): Promise<Result<void>> {
    const meetingOrError = await this.meetingEntityRepository.findOneAttr({
      _id: updateMeetingMemberRequest.meetingId,
      isActive: true,
    });
    if (meetingOrError.isFailure) {
      return Result.fail<void>(ErrorMessage.MEETINGS_IS_NOT_FOUND);
    }
    const meetingMemberOrError =
      await this.meetingMemberEntityRepository.findOneAttr({
        _id: updateMeetingMemberRequest.meetingMemberId,
        isActive: true,
      });

    if (meetingMemberOrError.isFailure) {
      return Result.fail<void>(ErrorMessage.MEETING_MEMBER_NOT_FOUND);
    }
    const meetingMember = meetingMemberOrError.getValue();
    const { meetingId, meetingMemberId, ...properties } =
      updateMeetingMemberRequest;

    for (const propertiesKey in properties) {
      switch (propertiesKey) {
        case 'memberType':
          meetingMember.memberType = properties[propertiesKey];
          break;
        case 'nickname':
          meetingMember.nickname = properties[propertiesKey];
          break;
        case 'isScreenSharing':
          meetingMember.isScreenSharing = properties[propertiesKey];
          break;
        case 'produceAudioAllowed':
          meetingMember.produceAudioAllowed = properties[propertiesKey];
          break;
        case 'produceAudioEnabled':
          meetingMember.produceAudioEnabled = properties[propertiesKey];
          break;
        case 'produceVideoAllowed':
          meetingMember.produceVideoAllowed = properties[propertiesKey];
          break;
        case 'produceVideoEnabled':
          meetingMember.produceVideoEnabled = properties[propertiesKey];
          break;
      }
    }
    await this.meetingMemberEntityRepository.findOneAndReplaceByAttr(
      {
        _id: new ObjectId(meetingMember.id),
      },
      meetingMember,
    );
    meetingMember.commit();
    return Result.ok<void>();
  }
}
