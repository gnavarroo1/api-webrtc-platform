import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Request,
  UseGuards,
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
import { JwtAuthGuard } from '../../../../auth/guards/jwt-auth.guard';
import { MeetingBroadcastRequestDto } from '../dtos/request/meeting-broadcast-request.dto';
import { StartMeetingBroadcastCommand } from '../../application/commands/start-meeting-broadcast/start-meeting-broadcast.command';
import { EndMeetingBroadcastCommand } from '../../application/commands/end-meeting-broadcast/end-meeting-broadcast.command';

@Controller('api/meetings')
export class MeetingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @UseGuards(JwtAuthGuard)
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
    return await this.queryBus.execute<GetMeetingQuery, MeetingDto>(
      new GetMeetingQuery(meetingId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createMeeting(
    @Request() req: any,
    @Body() request: any,
  ): Promise<CreateMeetingResponse> {
    const user = req.user;
    console.log(user);
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

  // @Post(':id/participants')
  // async addParticipant(
  //   @Headers() header: any,
  //   @Param('id') meetingId: string,
  //   @Body() request: any,
  // ): Promise<AddMeetingParticipantResponse> {
  //   const token = header['authorization'];
  //   const addParticipantRequest: AddMeetingParticipantRequest = {
  //     meetingId: meetingId,
  //     id: request.id,
  //     userType: request.userType,
  //     nickname: request.nickname,
  //     usertoken: token.substring(7, token.length),
  //   };
  //   return this.commandBus.execute<
  //     AddMeetingMemberCommand,
  //     AddMeetingParticipantResponse
  //   >(new AddMeetingMemberCommand(addParticipantRequest));
  // }

  // @Put(':id/participants/:idParticipant')
  // async updateParticipant(
  //   @Headers() header: any,
  //   @Param('id') meetingId: string,
  //   @Param('idParticipant') participantId: string,
  //   @Body() request: any,
  // ): Promise<AddMeetingParticipantResponse> {
  //   const token = header['authorization'];
  //   const updateParticipantRequest: UpdateMeetingParticipantRequest = {
  //     meetingId: meetingId,
  //     nickname: request.nickname,
  //     participantId: participantId,
  //     token: token.substring(7, token.length),
  //   };
  //
  //   return this.commandBus.execute<UpdateMeetingMemberCommand, any>(
  //     new UpdateMeetingMemberCommand(updateParticipantRequest),
  //   );
  // }

  // @Delete(':id/participants/:idParticipant')
  // async deleteParticipant(
  //   @Headers() header: any,
  //   @Param('id') meetingId: string,
  //   @Param('idParticipant') participantId: string,
  // ): Promise<void> {
  //   const token = header['authorization'];
  //   const removeMeetingMemberRequest: RemoveMeetingMemberRequest = {
  //     meetingId: meetingId,
  //     userToken: token.substring(7, token.length),
  //     participantId: participantId,
  //   };
  //   // console.log(removeMeetingMemberRequest);
  //   await this.commandBus.execute<RemoveMeetingMemberCommand, any>(
  //     new RemoveMeetingMemberCommand(removeMeetingMemberRequest),
  //   );
  // }
}
