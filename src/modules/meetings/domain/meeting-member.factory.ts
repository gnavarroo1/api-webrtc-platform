import { Injectable } from '@nestjs/common';
import { EntityFactory } from '../../../shared/generics/entity.factory';
import { MeetingMember } from './aggregates/meeting-member.aggregate';
import { ObjectId } from 'mongodb';
import { MeetingMemberEntityRepository } from '../infrastructure/repositories/meeting-member-entity.repository';

@Injectable()
export class MeetingMemberFactory implements EntityFactory<MeetingMember> {
  constructor(
    private readonly meetingMemberEntityRepository: MeetingMemberEntityRepository,
  ) {}

  async create(
    userId: string,
    meetingId: string,
    socketId: string,
    nickname: string,
    memberType = 'BOTH',
    isActive = true,
  ): Promise<MeetingMember> {
    const meetingMember = new MeetingMember(
      new ObjectId().toHexString(),
      userId,
      meetingId,
      socketId,
      nickname,
      memberType,
      isActive,
    );
    await this.meetingMemberEntityRepository.create(meetingMember);
    return meetingMember;
  }
}
