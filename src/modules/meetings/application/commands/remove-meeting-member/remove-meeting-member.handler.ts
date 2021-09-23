import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { RemoveMeetingMemberCommand } from './remove-meeting-member.command';
import { JwtService } from '@nestjs/jwt';
import { MeetingEntityRepository } from '../../../infrastructure/repositories/meeting-entity.repository';
import { Result } from '../../../../../shared/utils/functional-error-handler';
import { ErrorMessage } from '../../../domain/error.enum';
import { MeetingMemberEntityRepository } from '../../../infrastructure/repositories/meeting-member-entity.repository';

@CommandHandler(RemoveMeetingMemberCommand)
export class RemoveMeetingMemberHandler
  implements ICommandHandler<RemoveMeetingMemberCommand>
{
  constructor(
    private readonly meetingEntityRepository: MeetingEntityRepository,
    private readonly meetingMemberEntityRepository: MeetingMemberEntityRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly jwtService: JwtService,
  ) {}

  async execute({
    removeMeetingMemberRequest,
  }: RemoveMeetingMemberCommand): Promise<Result<any>> {
    try {
      // const user = this.jwtService.decode(
      //   removeMeetingMemberRequest.jwtToken,
      // ) as JwtPayload;
      const meetingMemberOrError =
        await this.meetingMemberEntityRepository.findOneAttr({
          socketId: removeMeetingMemberRequest.socketId,
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
      meetingMember.commit();
      return Result.ok<any>(meetingMember);
    } catch (e) {
      return Result.fail<any>(ErrorMessage.CREDENTIALS_ERROR);
    }
  }
}
