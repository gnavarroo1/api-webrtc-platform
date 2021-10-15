import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ListMeetingMembersQuery } from './list-meeting-members.query';
import { MeetingDtoRepository } from '../../../infrastructure/repositories/meeting-dto.repository';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorMessage } from '../../../domain/error.enum';
import { ListMeetingMembersResponse } from '../../../interfaces/dtos/response/list-meeting-members-response.dto';

@QueryHandler(ListMeetingMembersQuery)
export class ListMeetingMembersHandler
  implements IQueryHandler<ListMeetingMembersQuery>
{
  constructor(private readonly meetingDtoRepository: MeetingDtoRepository) {}
  async execute(
    query: ListMeetingMembersQuery,
  ): Promise<ListMeetingMembersResponse> {
    const meeting = await this.meetingDtoRepository.findMembers(
      query.meetingId,
    );
    if (!meeting) {
      throw new HttpException(
        ErrorMessage.MEETINGS_IS_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    const { activeMembers, activeViewers } = meeting;
    return { activeMembers, activeViewers };
  }
}
