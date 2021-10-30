import { VerificationEmailDto } from '../../../interfaces/dtos/event-dto/verification-email-dto';

export class UserCreatedEvent {
  constructor(public readonly verification: VerificationEmailDto) {}
}
