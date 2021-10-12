import { Injectable } from '@nestjs/common';
import { EntityFactory } from '../../../shared/generics/entity.factory';
import { MeetingMember } from './aggregates/meeting-member.aggregate';
import { ObjectId } from 'mongodb';
import { MeetingMemberEntityRepository } from '../infrastructure/repositories/meeting-member-entity.repository';
import { MediaCapabilities } from '../../../shared/types/common.types';

@Injectable()
export class MeetingMemberFactory implements EntityFactory<MeetingMember> {
  constructor(
    private readonly meetingMemberEntityRepository: MeetingMemberEntityRepository,
  ) {}

  async create(
    userId: string,
    sessionUserId: string,
    meetingId: string,
    socketId: string,
    nickname: string,
    memberType = 'BOTH',
    mediaCapabilities: MediaCapabilities,
    isActive = true,
  ): Promise<MeetingMember> {
    const meetingMember = new MeetingMember(
      new ObjectId().toHexString(),
      userId,
      sessionUserId,
      meetingId,
      socketId,
      nickname,
      memberType,
      mediaCapabilities,
      isActive,
    );
    await this.meetingMemberEntityRepository.create(meetingMember);
    return meetingMember;
  }
}
