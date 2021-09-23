import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AddMeetingMemberCommand } from '../../application/commands/add-meeting-member/add-meeting-member.command';
import { AddMeetingParticipantResponse } from '../dtos/response/add-meeting-participant-response.dto';
import { RemoveMeetingMemberCommand } from '../../application/commands/remove-meeting-member/remove-meeting-member.command';
import { Result } from '../../../../shared/utils/functional-error-handler';
import { MeetingMember } from '../../domain/aggregates/meeting-member.aggregate';
import { UpdateMeetingMemberRequest } from '../dtos/request/update-meeting-member-request.dto';
import { UpdateMeetingMemberCommand } from '../../application/commands/update-meeting-member/update-meeting-member.command';

@WebSocketGateway({
  cors: {
    methods: ['GET', 'POST'],
  },
  namespace: 'meeting-events',
})
export class MeetingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly commandBus: CommandBus) {}

  @WebSocketServer() wss: Server;
  private logger: Logger = new Logger('MeetingGateway');

  handleConnection(@ConnectedSocket() client: Socket): any {
    this.logger.log('Client connected: ' + client.id);
  }

  handleDisconnect(@ConnectedSocket() client: Socket): any {
    this.logger.log('Client disconnected: ' + client.id);
  }

  @SubscribeMessage('disconnecting')
  async handleDisconnecting(@ConnectedSocket() client: Socket): Promise<void> {
    this.logger.log('Client disconnecting: ' + client.id);
    const meetingMemberOrError = await this.commandBus.execute<
      RemoveMeetingMemberCommand,
      Result<any>
    >(
      new RemoveMeetingMemberCommand({
        socketId: client.id,
      }),
    );

    if (!meetingMemberOrError.isFailure) {
      const { meetingId, id } =
        meetingMemberOrError.getValue() as MeetingMember;
      this.wss.to(meetingId).emit('on-disconnect', { sender: id });
    }
  }

  @SubscribeMessage('on-disconnect')
  onDisconnect(@ConnectedSocket() client: Socket, @MessageBody() payload): any {
    console.log(`TESTING ON DISCONNECT EVENT FOR CLIENT ${client.id}`);
    this.wss.to(payload.room).emit('user-disconnected', client.id);
  }

  @SubscribeMessage('join-meeting')
  public async handleJoinMeeting(
    @ConnectedSocket() client: Socket,
    @MessageBody() addMeetingMemberRequest: any,
  ): Promise<any> {
    this.logger.warn(client.handshake.headers.authorization, 'join-meeting');
    try {
      const addMeetingParticipantResponseOrError =
        await this.commandBus.execute<
          AddMeetingMemberCommand,
          Result<AddMeetingParticipantResponse>
        >(new AddMeetingMemberCommand(addMeetingMemberRequest, client.id));
      if (!addMeetingParticipantResponseOrError.isFailure) {
        const addMeetingParticipantResponse =
          addMeetingParticipantResponseOrError.getValue();
        client.join(addMeetingMemberRequest.meetingId);
        console.log(
          'retornando valores y emitiendo a otros usuarios conectados',
        );
        this.wss
          .to(addMeetingMemberRequest.meetingId)
          .emit('join-meeting', addMeetingParticipantResponse);

        return {
          success: true,
          payload: addMeetingParticipantResponse,
        };
      } else {
        return {
          success: false,
          payload: addMeetingParticipantResponseOrError.error,
        };
      }
    } catch (e) {
      console.error(e);
      return {
        success: false,
        message: e.message,
      };
    }
  }

  @SubscribeMessage('end-meeting-session')
  handleEndMeetingSession(
    @ConnectedSocket() client: Socket,
    payload: any,
  ): any {
    this.wss.to(payload.roomId).emit('end-meeting-session', {
      msg: 'end-meeting',
    });
  }

  @SubscribeMessage('update-meeting-member')
  async handleUpdateMeetingParticipant(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: UpdateMeetingMemberRequest,
  ): Promise<any> {
    try {
      const updateMeetingMemberOrError = await this.commandBus.execute<
        UpdateMeetingMemberCommand,
        Result<any>
      >(new UpdateMeetingMemberCommand(payload, client.id));
      if (!updateMeetingMemberOrError.isFailure) {
        const updateMeetingMember = updateMeetingMemberOrError.getValue();
        client
          .to(payload.meetingId)
          .emit('update-meeting-member', updateMeetingMember);
      } else {
        return {
          success: false,
          payload: updateMeetingMemberOrError.error,
        };
      }
    } catch (e) {
      return {
        success: false,
        message: e.message,
      };
    }
    return;
  }

  @SubscribeMessage('start-broadcasting-session')
  handleStartBroadcastingSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ): any {
    client.to(payload.meetingId).emit('start-broadcasting-session', payload);
  }

  @SubscribeMessage('end-broadcasting-session')
  handleEndBroadcastingSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload,
  ) {
    client.to(payload.meetingId).emit('end-broadcasting-session', payload);
  }
}
