import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { MeetingBroadcastEvent } from './meeting-broadcast.event';

@EventsHandler(MeetingBroadcastEvent)
export class MeetingBroadcastHandler
  implements IEventHandler<MeetingBroadcastEvent>
{
  async handle({ isActive }: MeetingBroadcastEvent): Promise<void> {
    console.log(`Broadcasting is ${isActive ? 'active' : 'inactive'}`);
  }
}
