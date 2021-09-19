import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { GenerateMeetingTokenCommand } from './generate-meeting-token.command';
import { MeetingDto } from '../../../interfaces/dtos/meeting.dto';
import { MeetingDtoRepository } from '../../../infrastructure/repositories/meeting-dto.repository';
import { RpcException } from '@nestjs/microservices';
import { TokenMeetingResponse } from '../../../interfaces/dtos/response/token-meeting-response.dto';

@CommandHandler(GenerateMeetingTokenCommand)
export class GenerateMeetingTokenHandler
  implements ICommandHandler<GenerateMeetingTokenCommand>
{
  constructor(
    private readonly meetingDtoRepository: MeetingDtoRepository,
    private readonly eventPublisher: EventPublisher,
    private jwtService: JwtService,
  ) {}

  async execute({
    tokenMeetingRequest,
  }: GenerateMeetingTokenCommand): Promise<TokenMeetingResponse> {
    const meeting: MeetingDto = await this.meetingDtoRepository.find(
      tokenMeetingRequest.meetingId,
    );
    const decoded = this.jwtService.decode(tokenMeetingRequest.userId);
    // console.log(decoded);
    console.log(meeting.meetingCreatorId.toString());
    if (meeting.meetingCreatorId.toString() === decoded.sub) {
      return {
        token: this.jwtService.sign(
          { meeting: meeting._id },
          {
            expiresIn: '1d',
          },
        ),
      };
    } else {
      throw new RpcException('Invalid user credentials.');
    }
  }
}
