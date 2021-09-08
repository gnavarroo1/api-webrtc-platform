import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server, Namespace } from 'socket.io';
import { Logger } from '@nestjs/common';
import { AddMeetingParticipantRequest } from '../dtos/request/add-meeting-participant-request.dto';
import { CommandBus } from '@nestjs/cqrs';
import { AddMeetingParticipantCommand } from '../../application/commands/add-participant/add-meeting-participant.command';
import { AddMeetingParticipantResponse } from '../dtos/response/add-meeting-participant-response.dto';

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
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

  afterInit(): any {}

  handleConnection(client: Socket): any {
    this.logger.log('Client connected: ' + client.id);
  }

  handleDisconnect(client: Socket): any {
    this.logger.log('Client disconnected: ' + client.id);
  }

  @SubscribeMessage('disconnecting')
  handleDisconnecting(client: Socket): any {
    this.logger.log('Client disconnected: ' + client.id);
    // this.wss.to(participant.meetingId).emit('participant-disconnected', {
    //   id: participant.id,
    //   sender: client.id,
    // });
  }

  @SubscribeMessage('join-meeting')
  async handleJoinMeeting(
    client: Socket,
    addMeetingParticipantRequest: AddMeetingParticipantRequest,
  ) {
    //
    // console.log(addMeetingParticipantRequest);
    try {
      await this.commandBus
        .execute<AddMeetingParticipantCommand, AddMeetingParticipantResponse>(
          new AddMeetingParticipantCommand(
            addMeetingParticipantRequest,
            client.id,
          ),
        )
        .then((addMeetingParticipantResponse) => {
          console.log(addMeetingParticipantResponse);
          client.join(addMeetingParticipantRequest.meetingId);
          this.wss
            .to(addMeetingParticipantRequest.meetingId)
            .emit('join-meeting', addMeetingParticipantResponse);
        })
        .catch((e) => {
          console.log(e.message);
          throw new WsException(e.message);
        });
    } catch (e) {
      throw new WsException(e.message);
    }
    // this.wss.to(payload.roomId).emit('join-meeting', {
    //   id: payload.id,
    //   alias: payload.alias,
    //   socketId: client.id,
    // });
    // client.join(payload.roomId);
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
