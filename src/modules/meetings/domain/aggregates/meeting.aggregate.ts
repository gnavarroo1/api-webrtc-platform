import { AggregateRoot } from '@nestjs/cqrs';

export class Meeting extends AggregateRoot {
  constructor(
    private readonly _id: string,
    // private readonly name: string,
    private readonly _meetingCreatorId: string,
    // private participants: MeetingMemberDto[],
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
  // getName(): string {
  //   return this.name;
  // }
  // getParticipants(): MeetingMemberDto[] {
  //   return [...this.participants];
  // }
  getMeetingCreatorId(): string {
    return this._meetingCreatorId;
  }

  // addParticipant(participant: MeetingMemberDto) {
  //   if (
  //     participant.userType !== 'PARTICIPANT' &&
  //     participant.userType !== 'OBSERVER'
  //   ) {
  //     throw new HttpException(
  //       'THE USER IS ALREADY ON THE MEETING!',
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //   const idx = this.participants.findIndex((value) => {
  //     return value._id === participant._id;
  //   });
  //   if (idx !== -1) {
  //     throw new HttpException(
  //       'THE USER IS ALREADY ON THE MEETING!',
  //       HttpStatus.CONFLICT,
  //     );
  //   }
  //   this.participants.push(participant);
  // }
  //
  // deleteParticipant(participantId: Types.ObjectId) {
  //   this.participants = this.participants.filter((value) => {
  //     return value._id !== participantId;
  //   });
  // }
  //
  // updateParticipant(participant: MeetingMemberDto, index: number) {
  //   this.participants[index] = participant;
  // }
  //
  // getParticipant(participantId: Types.ObjectId) {
  //   return this.participants.find((value) => {
  //     return value._id === participantId;
  //   });
  // }
}
