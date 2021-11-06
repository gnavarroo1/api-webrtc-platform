import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddMeetingMemberSnapshotCommand } from './add-meeting-member-snapshot.command';
import { MonitoringService } from '../../services/monitoring.service';
import { Logger } from '@nestjs/common';

@CommandHandler(AddMeetingMemberSnapshotCommand)
export class AddMeetingMemberSnapshotHandler
  implements ICommandHandler<AddMeetingMemberSnapshotCommand>
{
  constructor(
    private monitoringService: MonitoringService, // private meetingMemberSnapshotEntityRepository: MeetingMemberSnapshotEntityRepository, // private meetingMemberSnapshotFactory: MeetingMemberSnapshotFactory, // private readonly eventPublisher: EventPublisher,
  ) {}
  private logger: Logger = new Logger('AddMeetingMemberSnapshotCommand');
  async execute({
    addMeetingMemberRequest,
  }: AddMeetingMemberSnapshotCommand): Promise<void> {
    this.logger.warn('snapshot', addMeetingMemberRequest);
    this.monitoringService
      .addMeetingMemberSnapshot(addMeetingMemberRequest)
      .then((data) => {
        return;
      });
  }
}
