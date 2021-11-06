import { Injectable, Logger } from '@nestjs/common';
import { MeetingMemberSnapshotEntityRepository } from '../../infrastructure/repositories/meeting-member-snapshot-entity.repository';
import { MeetingMemberSnapshotDtoRepository } from '../../infrastructure/repositories/meeting-member-snapshot-dto.repository';
import { EventPublisher } from '@nestjs/cqrs';
import { MeetingMemberSnapshotFactory } from '../../domain/meeting-member-snapshot.factory';

@Injectable()
export class MonitoringService {
  constructor(
    private meetingMemberSnapshotDtoRepository: MeetingMemberSnapshotDtoRepository,
    private meetingMemberSnapshotEntityRepository: MeetingMemberSnapshotEntityRepository,
    private meetingMemberSnapshotFactory: MeetingMemberSnapshotFactory,
    private readonly eventPublisher: EventPublisher,
  ) {}
  private logger: Logger = new Logger('Monitoring Service');
  async addMeetingMemberSnapshot(addMeetingMemberRequest: any): Promise<any> {
    this.logger.warn('Request', addMeetingMemberRequest);
    this.eventPublisher.mergeObjectContext(
      await this.meetingMemberSnapshotFactory.create(
        addMeetingMemberRequest.meetingId,
        addMeetingMemberRequest.meetingMemberId,
        addMeetingMemberRequest.p2pSnapshots,
        addMeetingMemberRequest.sfuSnapshot,
      ),
    );
  }

  async getMeetingsWithSnapshots(): Promise<any> {
    this.meetingMemberSnapshotDtoRepository;
  }
}
