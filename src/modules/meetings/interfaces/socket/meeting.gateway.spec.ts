import { Test, TestingModule } from '@nestjs/testing';
import { MeetingGateway } from './meeting.gateway';

describe('MeetingGateway', () => {
  let gateway: MeetingGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeetingGateway],
    }).compile();

    gateway = module.get<MeetingGateway>(MeetingGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
