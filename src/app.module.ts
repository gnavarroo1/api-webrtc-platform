import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { configuration } from './config/configurations';
import { JwtModule } from '@nestjs/jwt';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { SecurityModule } from './modules/security/security.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    MongooseModule.forRoot(process.env.MONGO_DB_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    }),
    JwtModule.register({
      secret: process.env.secret,
      signOptions: { expiresIn: '60d' },
    }),
    MeetingsModule,
    SecurityModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
