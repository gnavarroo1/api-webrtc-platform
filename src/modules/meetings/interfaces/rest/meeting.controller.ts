import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
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
import { AddMeetingParticipantResponse } from '../dtos/response/add-meeting-participant-response.dto';
import { DeleteMeetingCommand } from '../../application/commands/delete-meeting/delete-meeting.command';
import { UpdateMeetingParticipantRequest } from '../dtos/request/update-participant-request.dto';
import { UpdateMeetingMemberCommand } from '../../application/commands/update-member/update-meeting-member.command';

@Controller('api/meetings')
export class MeetingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':id/token')
  async getMeetingToken(
    @Headers() header: any,
    @Param('id') meetingId: string,
  ): Promise<TokenMeetingResponse> {
    const token = header['authorization'];
    const tokenMeetingRequest: TokenMeetingRequest = {
      meetingId: meetingId,
      userId: token.substring(7, token.length),
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

  @Post()
  async createMeeting(
    @Headers() header: any,
    @Body() request: any,
  ): Promise<CreateMeetingResponse> {
    console.log(header['authorization']);
    const token = header['authorization'];
    const createMeetingRequest: CreateMeetingRequest = {
      name: request.name,
      meetingCreatorId: token.substring(7, token.length),
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
    // console.log(header);
    return this.commandBus.execute<DeleteMeetingCommand, void>(
      new DeleteMeetingCommand({
        meetingId: meetingId,
        userToken: token.substring(7, token.length),
      }),
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

  @Put(':id/participants/:idParticipant')
  async updateParticipant(
    @Headers() header: any,
    @Param('id') meetingId: string,
    @Param('idParticipant') participantId: string,
    @Body() request: any,
  ): Promise<AddMeetingParticipantResponse> {
    const token = header['authorization'];
    const updateParticipantRequest: UpdateMeetingParticipantRequest = {
      meetingId: meetingId,
      nickname: request.nickname,
      participantId: participantId,
      token: token.substring(7, token.length),
    };

    return this.commandBus.execute<UpdateMeetingMemberCommand, any>(
      new UpdateMeetingMemberCommand(updateParticipantRequest),
    );
  }

  // @Delete(':id/participants/:idParticipant')
  // async deleteParticipant(
  //   @Headers() header: any,
  //   @Param('id') meetingId: string,
  //   @Param('idParticipant') participantId: string,
  // ): Promise<void> {
  //   const token = header['authorization'];
  //   const removeMeetingParticipantRequest: RemoveMeetingParticipantRequest = {
  //     meetingId: meetingId,
  //     userToken: token.substring(7, token.length),
  //     participantId: participantId,
  //   };
  //   // console.log(removeMeetingParticipantRequest);
  //   await this.commandBus.execute<RemoveMeetingParticipantCommand, any>(
  //     new RemoveMeetingParticipantCommand(removeMeetingParticipantRequest),
  //   );
  // }
}
