import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose';

import { UserEntityRepository } from './infrastructure/repositories/user-entity.repository';
import { UserCommandHandlers } from './application/commands';
import { UserSchema } from '../../shared/infrastructure/schemas/user.schema';
import { UserDtoRepository } from './infrastructure/repositories/user-dto.repository';
import { UserFactory } from './domain/UserFactory';
import { UserEventHandlers } from './application/events';
import { UserSchemaFactory } from './infrastructure/schemas/user-schema.factory';
import { SecurityController } from './interfaces/rest/security.controller';
import { JwtModule } from '@nestjs/jwt';
import { SharedModule } from '../../shared/shared.module';
import { SecurityService } from './application/services/security/security.service';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      {
        name: UserSchema.name,
        schema: SchemaFactory.createForClass(UserSchema),
      },
    ]),
    JwtModule.register({
      secret: process.env.secret || 'secret123',
      signOptions: { expiresIn: '60d' },
    }),
    SharedModule,
  ],
  controllers: [SecurityController],
  providers: [
    UserEntityRepository,
    UserDtoRepository,
    UserSchemaFactory,
    UserFactory,
    ...UserCommandHandlers,
    ...UserEventHandlers,
    SecurityService,
  ],
})
export class SecurityModule {}
