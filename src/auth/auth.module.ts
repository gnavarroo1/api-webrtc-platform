import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SecurityModule } from '../modules/security/security.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './passport/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Global()
@Module({
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  imports: [SecurityModule, PassportModule],
  exports: [AuthService],
})
export class AuthModule {}
