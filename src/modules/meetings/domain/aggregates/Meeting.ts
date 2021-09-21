import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { AggregateRoot } from '@nestjs/cqrs';
import { UserDto } from '../../interfaces/dtos/user.dto';
import { RpcException } from '@nestjs/microservices';

export class Meeting extends AggregateRoot {
  constructor(
    private readonly _id: string,
    private readonly name: string,
    private readonly _meetingCreatorId: string,
    private participants: UserDto[],
    private active: boolean,
  ) {
    super();
  }

  isActive(): boolean {
    return this.active;
  }

  setActive(value: boolean) {
    this.active = value;
  }

  getActive(): boolean {
    return this.active;
  }

  getId(): string {
    return this._id;
  }
  getName(): string {
    return this.name;
  }
  getParticipants(): UserDto[] {
    return [...this.participants];
  }
  getMeetingCreatorId(): string {
    return this._meetingCreatorId;
  }

  addParticipant(participant: UserDto) {
    if (
      participant.userType !== 'PARTICIPANT' &&
      participant.userType !== 'OBSERVER'
    ) {
      throw new HttpException('INVALID USER!', HttpStatus.BAD_REQUEST);
    }
    const idx = this.participants.findIndex((value) => {
      return value._id === participant._id;
    });
    if (idx !== -1) {
      this.updateParticipant(participant, idx);
    }
    this.participants.push(participant);
  }

  deleteParticipant(participantId: string) {
    this.participants = this.participants.filter((value) => {
      return value._id !== participantId;
    });
  }

  updateParticipant(participant: UserDto, index: number) {
    this.participants[index] = participant;
  }

  getParticipant(participantId: string) {
    return this.participants.find((value) => {
      return value._id === participantId;
    });
  }
}
