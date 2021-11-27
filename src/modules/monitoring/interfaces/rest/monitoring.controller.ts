import { Body, Controller, Logger, Param, Post } from '@nestjs/common';

import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AddMeetingMemberSnapshotCommand } from '../../applications/commands/add-meeting-member-snapshot/add-meeting-member-snapshot.command';
import { MonitoringService } from '../../applications/services/monitoring.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MeetingMemberSnapshotDto } from '../dtos/meeting-member-snapshot.dto';

@ApiTags('api/monitoring')
@Controller('api/monitoring')
export class MonitoringController {
  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  private logger: Logger = new Logger('MonitoringController');

  @ApiOperation({ summary: 'Create meeting member snapshot' })
  @ApiResponse({ status: 200 })
  @Post('meetings/:id/snapshots')
  saveMeetingMemberSnapshot(
    @Param('id') meetingId: string,
    @Body() request: MeetingMemberSnapshotDto,
  ): Promise<any> {
    return this.commandBus.execute<AddMeetingMemberSnapshotCommand, void>(
      new AddMeetingMemberSnapshotCommand(request),
    );
  }

  @Post('meetings/:id/meeting-members')
  getMeetingMembersSnapshotsList(
    @Param('id') meetingId: string,
    @Body() request: Record<string, any>,
  ): Promise<void> {
    const page = request.start / request.length;
    return this.monitoringService.getMeetingMemberListFromMeeting(
      meetingId,
      page,
      request.length,
    );
  }

  @Post('meetings')
  getMeetingList(@Body() request: Record<string, any>): Promise<any> {
    const page = request.start / request.length;
    return this.monitoringService.getMeetings(page, request.length);
  }

  @Post('meetings/:id/snapshots/:meetingMemberId')
  getMeetingMemberSnapshot(
    @Param('id') meetingId: string,
    @Param('meetingMemberId') meetingMemberId: string,
    @Body() request: Record<string, any>,
  ): Promise<void> {
    return this.monitoringService.getMeetingMembersSnapshotsFromMeeting(
      meetingId,
      meetingMemberId,
    );
  }
}
