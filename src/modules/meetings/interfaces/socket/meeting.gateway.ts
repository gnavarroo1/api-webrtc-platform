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
  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
    this.logger.log('Client disconnected: ' + client.id);
    await this.commandBus
      .execute<RemoveMeetingMemberCommand, Result<any>>(
        new RemoveMeetingMemberCommand({
          socketId: client.id,
        }),
      )
      .then((meetingMemberOrError) => {
        if (!meetingMemberOrError.isFailure) {
          const { meetingId, id } =
            meetingMemberOrError.getValue() as MeetingMember;
          this.wss
            .to(meetingId)
            .emit('meetingMemberDisconnected', { sender: id });
        } else {
          this.logger.error('isFailure', meetingMemberOrError.error);
        }
      });
  }
  @SubscribeMessage('onDisconnect')
  onDisconnect(@ConnectedSocket() client: Socket, @MessageBody() payload): any {
    this.wss.to(payload.room).emit('userDisconnected', client.id);
  }
  @SubscribeMessage('joinMeeting')
  public async handleJoinMeeting(
    @ConnectedSocket() client: Socket,
    @MessageBody() addMeetingMemberRequest: any,
  ): Promise<any> {
    this.logger.warn(client.handshake.headers.authorization, 'joinMeeting');
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
        client
          .to(addMeetingMemberRequest.meetingId)
          .emit('joinMeeting', addMeetingParticipantResponse);

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
      return {
        success: false,
        message: e.message,
      };
    }
  }
  @SubscribeMessage('endMeetingSession')
  handleEndMeetingSession(
    @ConnectedSocket() client: Socket,
    payload: any,
  ): any {
    this.wss.to(payload.roomId).emit('endMeetingSession', {
      msg: 'endMeeting',
    });
  }
  @SubscribeMessage('updateMeetingMember')
  async handleUpdateMeetingParticipant(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: UpdateMeetingMemberRequest,
  ): Promise<any> {
    try {
      const updateMeetingMemberOrError = await this.commandBus.execute<
        UpdateMeetingMemberCommand,
        Result<any>
      >(new UpdateMeetingMemberCommand(payload));
      if (!updateMeetingMemberOrError.isFailure) {
        const updateMeetingMember = updateMeetingMemberOrError.getValue();
        client
          .to(payload.meetingId)
          .emit('updateMeetingMember', updateMeetingMember);
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
  @SubscribeMessage('startScreenSharing')
  async handleStartScreenSharing(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: UpdateMeetingMemberRequest,
  ): Promise<any> {
    const updateMeetingMemberOrError = await this.commandBus.execute<
      UpdateMeetingMemberCommand,
      Result<any>
    >(new UpdateMeetingMemberCommand(payload));
    if (!updateMeetingMemberOrError.isFailure) {
      client.to(payload.meetingId).emit('startScreenSharing', payload);
    } else {
      return {
        success: false,
        payload: updateMeetingMemberOrError.error,
      };
    }
  }
  @SubscribeMessage('endScreenSharing')
  async handleEndScreenSharing(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ): Promise<any> {
    const updateMeetingMemberOrError = await this.commandBus.execute<
      UpdateMeetingMemberCommand,
      Result<any>
    >(new UpdateMeetingMemberCommand(payload));
    if (!updateMeetingMemberOrError.isFailure) {
      client.to(payload.meetingId).emit('endScreenSharing', payload);
    } else {
      return {
        success: false,
        payload: updateMeetingMemberOrError.error,
      };
    }
  }
  @SubscribeMessage('toggleGlobalAudio')
  async handleToggleGlobalAudio(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ): Promise<any> {
    const updateMeetingMemberOrError = await this.commandBus.execute<
      UpdateMeetingMemberCommand,
      Result<any>
    >(new UpdateMeetingMemberCommand(payload));
    if (!updateMeetingMemberOrError.isFailure) {
      this.wss.to(payload.meetingId).emit('toggleGlobalAudio', payload);
      return {
        success: true,
      };
    } else {
      return {
        success: false,
        payload: updateMeetingMemberOrError.error,
      };
    }
  }
  @SubscribeMessage('toggleGlobalVideo')
  async handleToggleGlobalVideo(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ): Promise<any> {
    const updateMeetingMemberOrError = await this.commandBus.execute<
      UpdateMeetingMemberCommand,
      Result<any>
    >(new UpdateMeetingMemberCommand(payload));
    if (!updateMeetingMemberOrError.isFailure) {
      this.wss.to(payload.meetingId).emit('toggleGlobalVideo', payload);
      return {
        success: true,
      };
    } else {
      return {
        success: false,
        payload: updateMeetingMemberOrError.error,
      };
    }
  }
  @SubscribeMessage('toggleAudio')
  async handleToggleMemberAudio(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ): Promise<any> {
    const updateMeetingMemberOrError = await this.commandBus.execute<
      UpdateMeetingMemberCommand,
      Result<any>
    >(new UpdateMeetingMemberCommand(payload));
    if (!updateMeetingMemberOrError.isFailure) {
      client.to(payload.meetingId).emit('toggleAudio', payload);
      return {
        success: true,
      };
    } else {
      return {
        success: false,
        payload: updateMeetingMemberOrError.error,
      };
    }
  }
  @SubscribeMessage('toggleVideo')
  async handleToggleMemberVideo(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ): Promise<any> {
    const updateMeetingMemberOrError = await this.commandBus.execute<
      UpdateMeetingMemberCommand,
      Result<any>
    >(new UpdateMeetingMemberCommand(payload));
    if (!updateMeetingMemberOrError.isFailure) {
      client.to(payload.meetingId).emit('toggleVideo', payload);
      return {
        success: true,
      };
    } else {
      return {
        success: false,
        payload: updateMeetingMemberOrError.error,
      };
    }
  }
  @SubscribeMessage('toggleScreenSharePermission')
  async handleToggleMemberScreenSharePermission(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ): Promise<any> {
    const updateMeetingMemberOrError = await this.commandBus.execute<
      UpdateMeetingMemberCommand,
      Result<any>
    >(new UpdateMeetingMemberCommand(payload));
    if (!updateMeetingMemberOrError.isFailure) {
      client.to(payload.meetingId).emit('toggleScreenSharePermission', payload);
      return {
        success: true,
      };
    } else {
      return {
        success: false,
        payload: updateMeetingMemberOrError.error,
      };
    }
  }
  @SubscribeMessage('toggleConnectionType')
  async handleToggleConnectionType(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ): Promise<any> {
    const updateMeetingMemberOrError = await this.commandBus.execute<
      UpdateMeetingMemberCommand,
      Result<any>
    >(new UpdateMeetingMemberCommand(payload));
    if (updateMeetingMemberOrError.isFailure) {
      return {
        success: false,
        payload: updateMeetingMemberOrError.error,
      };
    } else {
      client.to(payload.meetingId).emit('toggleConnectionType', payload);
      return {
        success: true,
      };
    }
  }
  @SubscribeMessage('chatMessage')
  handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ): any {
    client.to(payload.meetingId).emit('chatMessage', payload.message);
  }
}
