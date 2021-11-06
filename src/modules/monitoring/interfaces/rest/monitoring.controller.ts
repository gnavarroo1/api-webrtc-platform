import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';

import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AddMeetingMemberSnapshotCommand } from '../../applications/commands/add-meeting-member-snapshot/add-meeting-member-snapshot.command';

@Controller('api/monitoring')
export class MonitoringController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  private logger: Logger = new Logger('MonitoringController');
  @Get('meetings')
  getMeetingList(): Promise<any> {
    return;
  }

  @Post('meetings/:id/snapshots')
  saveMeetingMemberSnapshot(
    @Param('id') meetingId: string,
    @Body() request: any,
  ): Promise<any> {
    this.logger.warn('controller request', request);
    return this.commandBus.execute<AddMeetingMemberSnapshotCommand, void>(
      new AddMeetingMemberSnapshotCommand(request),
    );
  }

  @Get('meetings/:id/snapshots')
  getMeetingMembersSnapshotsList(
    @Param('id') meetingId: string,
  ): Promise<void> {
    return;
  }

  @Get('meetings/:id/snapshots/:meetingMemberId')
  getMeetingMemberSnapshot(
    @Param('id') meetingId: string,
    @Param('meetingMemberId') meetingMemberId: string,
  ): Promise<void> {
    return;
  }
}
