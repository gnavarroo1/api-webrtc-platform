import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose';

import { MeetingSchema } from './infrastructure/schemas/meeting.schema';
import { MeetingEntityRepository } from './infrastructure/repositories/meeting-entity.repository';
import { MeetingDtoRepository } from './infrastructure/repositories/meeting-dto.repository';
import { MeetingSchemaFactory } from './infrastructure/schemas/meeting-schema.factory';
import { MeetingCommandHandlers } from './application/commands';
import { MeetingFactory } from './domain/MeetingFactory';
import { MeetingController } from './interfaces/controller/meeting.controller';
import { MeetingQueryHandlers } from './application/queries';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      {
        name: MeetingSchema.name,
        schema: SchemaFactory.createForClass(MeetingSchema),
      },
    ]),
    JwtModule.register({
      secret: process.env.secret || 'secret123',
      signOptions: { expiresIn: '60d' },
    }),
  ],
  controllers: [MeetingController],
  providers: [
    MeetingEntityRepository,
    MeetingDtoRepository,
    MeetingSchemaFactory,
    MeetingFactory,
    ...MeetingCommandHandlers,
    ...MeetingQueryHandlers,
  ],
})
export class MeetingsModule {}
