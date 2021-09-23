import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { GenerateGuestTokenCommand } from './generate-guest-token.command';
import { JwtPayload } from '../../../../../shared/infrastructure/dto/jwt-payload.dto';
import { ObjectId } from 'mongodb';

@CommandHandler(GenerateGuestTokenCommand)
export class GenerateGuestTokenHandler
  implements ICommandHandler<GenerateGuestTokenCommand>
{
  constructor(
    private readonly eventPublisher: EventPublisher,
    private jwtService: JwtService,
  ) {}
  async execute(): // generateGuestTokenCommand: GenerateGuestTokenCommand,
  Promise<any> {
    const payload: JwtPayload = {
      sessionId: new ObjectId().toHexString(),
      isGuest: true,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
