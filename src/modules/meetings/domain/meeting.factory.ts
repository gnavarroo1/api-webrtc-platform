import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { EntityFactory } from '../../../shared/generics/entity.factory';
import { Meeting } from './aggregates/meeting.aggregate';
import { MeetingEntityRepository } from '../infrastructure/repositories/meeting-entity.repository';

@Injectable()
export class MeetingFactory implements EntityFactory<Meeting> {
  constructor(
    private readonly meetingEntityRepository: MeetingEntityRepository,
  ) {}

  async create(
    meetingCreatorId: string,
    isBroadcasting = false,
    active = true,
  ): Promise<Meeting> {
    const meeting = new Meeting(
      new ObjectId().toHexString(),
      meetingCreatorId,
      isBroadcasting,
      active,
    );
    await this.meetingEntityRepository.create(meeting);
    return meeting;
  }
}
