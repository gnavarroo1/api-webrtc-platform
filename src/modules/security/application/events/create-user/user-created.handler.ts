import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserCreatedEvent } from './user-created.event';
import { EmailService } from '../../services/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent> {
  constructor(
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async handle({ verification }: UserCreatedEvent): Promise<void> {
    const token = this.jwtService.sign(verification, {
      secret: this.configService.get('email.secret'),
      expiresIn: `${this.configService.get('email.expiresIn')}s`,
    });

    const url = `${this.configService.get(
      'email.emailConfirmationUrl',
    )}?token=${token}`;
    const text = `Welcome to the application. To confirm the email address, click here: ${url}`;
    return this.emailService.sendMail({
      to: verification.email,
      subject: 'Email confirmation',
      text,
    });
  }
}
