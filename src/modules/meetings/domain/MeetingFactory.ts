import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { EntityFactory } from '../../../shared/entity.factory';
import { Meeting } from './aggregates/Meeting';
import { MeetingEntityRepository } from '../infrastructure/repositories/meeting-entity.repository';
import { UserDto } from '../interfaces/dtos/user.dto';

@Injectable()
export class MeetingFactory implements EntityFactory<Meeting> {
  constructor(
    private readonly meetingEntityRepository: MeetingEntityRepository,
  ) {}

  async create(
    name: string,
    meetingCreatorId: string,
    participants: UserDto[] = [],
    active = true,
  ): Promise<Meeting> {
    const meeting = new Meeting(
      new ObjectId().toHexString(),
      name,
      meetingCreatorId,
      participants,
      active,
    );
    await this.meetingEntityRepository.create(meeting);
    return meeting;
  }
}
