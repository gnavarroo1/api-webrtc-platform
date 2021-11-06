import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MeetingMemberSnapshotDocument } from '../../../../shared/infrastructure/schemas/meeting-member-snapshot.schema';

@Injectable()
export class MeetingMemberSnapshotDtoRepository {
  constructor(
    @InjectModel(MeetingMemberSnapshotDocument.name)
    private readonly meetingMemberSnapshotModel: Model<MeetingMemberSnapshotDocument>,
  ) {}

  async findMeetings(page = 0, size = 15): Promise<any> {
    return this.meetingMemberSnapshotModel.aggregate([
      {
        $group: {
          _id: '$meetingId',
          meetingMembers: {
            $addToSet: '$meetingMemberId',
          },
          totalSnapshots: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $facet: {
          paginatedResults: [
            {
              $skip: size * page,
            },
            { $limit: page },
          ],
          totalCount: [
            {
              $count: 'count',
            },
          ],
        },
      },
    ]);
  }

  async findMeetingMembers(
    meetingId: string,
    page = 0,
    size = 15,
  ): Promise<any> {
    return this.meetingMemberSnapshotModel.aggregate([
      {
        $match: {
          meetingId: meetingId,
        },
      },
      {
        $group: {
          _id: '$meetingMemberId',
          totalSnapshots: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $facet: {
          paginatedResults: [
            {
              $skip: size * page,
            },
            { $limit: page },
          ],
          totalCount: [
            {
              $count: 'count',
            },
          ],
        },
      },
    ]);
  }
  async findMeetingMemberSnapshots(meetingId: string, meetingMemberId: string) {
    return this.meetingMemberSnapshotModel.find({
      meetingId: meetingId,
      meetingMemberId: meetingMemberId,
    });
  }
}
