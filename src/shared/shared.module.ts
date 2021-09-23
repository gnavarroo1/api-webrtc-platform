import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.SECRET || 'secret123',
      signOptions: { expiresIn: '360d' },
    }),
  ],
  exports: [JwtModule],
})
export class SharedModule {}
