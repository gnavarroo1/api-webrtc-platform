import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { EntityFactory } from '../../../shared/generics/entity.factory';
import { Meeting } from './aggregates/meeting.aggregate';
import { MeetingEntityRepository } from '../infrastructure/repositories/meeting-entity.repository';
import { MeetingMemberDto } from '../interfaces/dtos/meeting-member.dto';

@Injectable()
export class MeetingFactory implements EntityFactory<Meeting> {
  constructor(
    private readonly meetingEntityRepository: MeetingEntityRepository,
  ) {}

  async create(
    // name: string,
    meetingCreatorId: string,
    participants: MeetingMemberDto[] = [],
    active = true,
  ): Promise<Meeting> {
    const meeting = new Meeting(
      new ObjectId().toHexString(),
      // name,
      meetingCreatorId,
      // participants,
      active,
    );
    await this.meetingEntityRepository.create(meeting);
    return meeting;
  }
}
