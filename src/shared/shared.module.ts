import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// @Global()
@Module({ imports: [MongooseModule.forRoot(process.env.MONGO_DB_URI)] })
export class SharedModule {}
