import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MeetingDto } from '../../../interfaces/dtos/meeting.dto';
import { MeetingDtoRepository } from '../../../infrastructure/repositories/meeting-dto.repository';
import { GetMeetingQuery } from './get-meeting.query';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorMessage } from '../../../domain/error.enum';

@QueryHandler(GetMeetingQuery)
export class GetMeetingHandler implements IQueryHandler<GetMeetingQuery> {
  constructor(private readonly meetingDtoRepository: MeetingDtoRepository) {}
  async execute(query: GetMeetingQuery): Promise<MeetingDto> {
    const meeting = await this.meetingDtoRepository.find(query.meetingId);
    if (!meeting) {
      throw new HttpException(
        ErrorMessage.MEETINGS_IS_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      _id: meeting._id,
      meetingCreatorId: meeting.meetingCreatorId,
      isActive: meeting.isActive,
      isBroadcasting: meeting.isBroadcasting,
    };
  }
}
