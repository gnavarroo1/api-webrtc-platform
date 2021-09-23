export class MeetingBroadcastEvent {
  constructor(public readonly isActive: boolean, public readonly id: string) {}
}
