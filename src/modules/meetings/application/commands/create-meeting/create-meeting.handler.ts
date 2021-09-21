import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { MeetingFactory } from '../../../domain/meeting.factory';
import { CreateMeetingCommand } from './create-meeting.command';
import { JwtService } from '@nestjs/jwt';
import { CreateMeetingResponse } from '../../../interfaces/dtos/response/create-meeting-response.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorMessage } from 'src/modules/meetings/domain/error.enum';

@CommandHandler(CreateMeetingCommand)
export class CreateMeetingHandler
  implements ICommandHandler<CreateMeetingCommand>
{
  constructor(
    private readonly meetingFactory: MeetingFactory,
    private readonly eventPublisher: EventPublisher,
    private jwtService: JwtService,
  ) {}

  async execute({
    createMeetingRequest,
  }: CreateMeetingCommand): Promise<CreateMeetingResponse> {
    const { name, meetingCreatorId } = createMeetingRequest;
    //Validate that the token exists
    if (!meetingCreatorId) {
      throw new HttpException(
        ErrorMessage.CREDENTIALS_ERROR,
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.jwtService
      .verifyAsync(meetingCreatorId)
      .then(async (verify) => {
        const meeting = this.eventPublisher.mergeObjectContext(
          await this.meetingFactory.create(verify.sub),
        );
        meeting.commit();
        return {
          id: meeting.getId(),
        };
      })
      .catch((e) => {
        throw new HttpException(e.message, HttpStatus.UNAUTHORIZED);
      });
  }
}
