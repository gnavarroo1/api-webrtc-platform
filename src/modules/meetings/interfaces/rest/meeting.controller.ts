import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MeetingDto } from '../dtos/meeting.dto';
import { CreateMeetingCommand } from '../../application/commands/create-meeting/create-meeting.command';
import { CreateMeetingRequest } from '../dtos/request/create-meeting-request.dto';
import { GetMeetingQuery } from '../../application/queries/get-meeting-info/get-meeting.query';
import { TokenMeetingRequest } from '../dtos/request/token-meeting-request.dto';
import { GenerateMeetingTokenCommand } from '../../application/commands/generate-token/generate-meeting-token.command';
import { CreateMeetingResponse } from '../dtos/response/create-meeting-response.dto';
import { TokenMeetingResponse } from '../dtos/response/token-meeting-response.dto';
import { DeleteMeetingCommand } from '../../application/commands/delete-meeting/delete-meeting.command';
import { MeetingBroadcastRequestDto } from '../dtos/request/meeting-broadcast-request.dto';
import { StartMeetingBroadcastCommand } from '../../application/commands/start-meeting-broadcast/start-meeting-broadcast.command';
import { EndMeetingBroadcastCommand } from '../../application/commands/end-meeting-broadcast/end-meeting-broadcast.command';
import { ListMeetingMembersQuery } from '../../application/queries/list-meeting-members/list-meeting-members.query';
import { UpdateMeetingMemberRequest } from '../dtos/request/update-meeting-member-request.dto';
import { UpdateMeetingMemberCommand } from '../../application/commands/update-meeting-member/update-meeting-member.command';
import { ErrorMessage } from '../../domain/error.enum';

@Controller('api/meetings')
export class MeetingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':id/token')
  async getMeetingToken(
    @Request() req,
    @Param('id') meetingId: string,
  ): Promise<TokenMeetingResponse> {
    const id = req.user.id;
    const tokenMeetingRequest: TokenMeetingRequest = {
      meetingId: meetingId,
      userId: id,
    };
    return this.commandBus.execute<
      GenerateMeetingTokenCommand,
      TokenMeetingResponse
    >(new GenerateMeetingTokenCommand(tokenMeetingRequest));
  }

  @Get(':id')
  async getMeeting(@Param('id') meetingId: string): Promise<MeetingDto> {
    return this.queryBus.execute<GetMeetingQuery, MeetingDto>(
      new GetMeetingQuery(meetingId),
    );
  }

  @Post()
  async createMeeting(
    @Request() req: any,
    @Body() request: any,
  ): Promise<CreateMeetingResponse> {
    const createMeetingRequest: CreateMeetingRequest = {
      meetingCreatorId: request.meetingCreatorId,
    };
    return this.commandBus.execute<CreateMeetingCommand, CreateMeetingResponse>(
      new CreateMeetingCommand(createMeetingRequest),
    );
  }

  @Delete(':id')
  deleteMeeting(
    @Headers() header: any,
    @Param('id') meetingId: string,
  ): Promise<void> {
    const token = header['authorization'];

    return this.commandBus.execute<DeleteMeetingCommand, void>(
      new DeleteMeetingCommand({
        meetingId: meetingId,
        userToken: token.substring(7, token.length),
      }),
    );
  }

  @Post(':id/broadcasting/start')
  startBroadcastingSession(
    @Param('id') meetingId: string,
    @Body() request: MeetingBroadcastRequestDto,
  ): Promise<any> {
    return this.commandBus.execute<StartMeetingBroadcastCommand, any>(
      new StartMeetingBroadcastCommand(request),
    );
  }
  @Post(':id/broadcasting/end')
  endBroadcastingSession(
    @Param('id') meetingId: string,
    @Body() request: MeetingBroadcastRequestDto,
  ): Promise<any> {
    return this.commandBus.execute<EndMeetingBroadcastCommand, any>(
      new EndMeetingBroadcastCommand(request),
    );
  }

  @Get(':id/members')
  async getMeetingMembers(@Param('id') meetingId: string): Promise<any> {
    return this.queryBus.execute<ListMeetingMembersQuery, any>(
      new ListMeetingMembersQuery(meetingId),
    );
  }

  @Put(':id/members/:idMember')
  async updateMeetingMember(
    @Param('id') meetingId: string,
    @Param('idMember') meetingMemberId: string,
    @Body() updateParticipantRequest: UpdateMeetingMemberRequest,
  ): Promise<void> {
    if (meetingId !== updateParticipantRequest.meetingId) {
      throw new HttpException(
        ErrorMessage.CREDENTIALS_ERROR,
        HttpStatus.CONFLICT,
      );
    }
    if (meetingMemberId !== updateParticipantRequest.meetingMemberId) {
      throw new HttpException(
        ErrorMessage.CREDENTIALS_ERROR,
        HttpStatus.CONFLICT,
      );
    }

    const resultOrError = await this.commandBus.execute<
      UpdateMeetingMemberCommand,
      any
    >(new UpdateMeetingMemberCommand(updateParticipantRequest));
    if (!resultOrError.isFailure) {
      return;
    } else {
      throw new HttpException(resultOrError.error, HttpStatus.NOT_FOUND);
    }
  }
}
