import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { AddMeetingMemberRequest } from '../dtos/request/add-meeting-member-request.dto';
import { CommandBus } from '@nestjs/cqrs';
import { AddMeetingMemberCommand } from '../../application/commands/add-participant/add-meeting-member.command';
import { AddMeetingParticipantResponse } from '../dtos/response/add-meeting-participant-response.dto';
import { RemoveMeetingParticipantCommand } from '../../application/commands/remove-member/remove-meeting-participant.command';
import { Result } from '../../../../shared/utils/functional-error-handler';

@WebSocketGateway({
  cors: {
    methods: ['GET', 'POST'],
  },
  namespace: 'meeting-events',
})
export class MeetingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly commandBus: CommandBus) {}

  @WebSocketServer() wss: Server;
  private logger: Logger = new Logger('MeetingGateway');
  // @SubscribeMessage('message')
  // handleMessage(client: any, payload: any): string {
  //   return 'Hello world!';
  // }

  afterInit(): any {}

  handleConnection(client: Socket): any {
    this.logger.log('Client connected: ' + client.id);
  }

  handleDisconnect(client: Socket): any {
    this.logger.log('Client disconnected: ' + client.id);
  }

  @SubscribeMessage('disconnecting')
  async handleDisconnecting(client: Socket, payload: any): Promise<void> {
    // console.log('PAYLOAD => ', payload);
    // console.log(this.wss.sockets.adapter.rooms);
    const auth_token = client.handshake.headers.authorization;
    // console.log('AUTH_TOKEN', auth_token);
    this.logger.log('Client disconnected: ' + client.id);
    const meetingMemberOrError = await this.commandBus.execute<
      RemoveMeetingParticipantCommand,
      Result<any>
    >(
      new RemoveMeetingParticipantCommand({
        socketId: client.id,
        userToken: auth_token,
      }),
    );

    if (!meetingMemberOrError.isFailure) {
      const meetingMember = meetingMemberOrError.getValue();
      this.wss
        .to(meetingMember.meetingId)
        .emit('on-disconnect', { sender: client.id });
    }
  }
  @SubscribeMessage('on-disconnect')
  onDisconnect(client: Socket, payload): any {
    console.log(`TESTING ON DISCONNECT EVENT FOR CLIENT ${client.id}`);
    this.wss.to(payload.room).emit('user-disconnected', client.id);
  }

  @SubscribeMessage('join-meeting')
  async handleJoinMeeting(
    @ConnectedSocket() client: Socket,
    @MessageBody() addMeetingMemberRequest: AddMeetingMemberRequest,
  ): Promise<void> {
    //let auth_token = socket.handshake.headers.authorization;
    try {
      await this.commandBus
        .execute<AddMeetingMemberCommand, AddMeetingParticipantResponse>(
          new AddMeetingMemberCommand(addMeetingMemberRequest, client.id),
        )
        .then((addMeetingParticipantResponse) => {
          // console.log('recibo response', addMeetingParticipantResponse);
          client.join(addMeetingMemberRequest.meetingId);
          //todo emit event
          this.wss
            .to(addMeetingMemberRequest.meetingId)
            .emit('join-meeting', addMeetingParticipantResponse);
        })
        .catch((e) => {
          console.error('handleJoinMeeting', e);
          throw new WsException(e.message);
        });
    } catch (e) {
      console.error(e);
      throw new WsException(e.message);
    }
  }

  @SubscribeMessage('end-meeting-session')
  handleEndMeetingSession(client: Socket, payload: any): any {
    this.wss.to(payload.roomId).emit('end-meeting-session', {
      msg: 'end-meeting',
    });
  }

  @SubscribeMessage('update-participant')
  handleUpdateMeetingParticipant(client: Socket, payload: any): any {}
}
