import { ObjectId } from 'mongoose';
import { UserDto } from './user.dto';

export class MeetingDto {
  readonly _id?: string;
  readonly name?: string;
  readonly meetingCreatorId?: string;
  readonly participants?: UserDto[];
}
