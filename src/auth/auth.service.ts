import { Injectable } from '@nestjs/common';
import { SecurityService } from '../modules/security/application/services/security.service';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private securityService: SecurityService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.securityService.findOneByUsername(username);
    if (this.validatePassword(user.hash, user.salt, pass)) {
      const { _id } = user;
      return _id;
    }

    return null;
  }
  private async validateTokenPayload(payload): Promise<any> {}
  private validatePassword(userHash: string, salt: string, password: string) {
    const hash = crypto
      .pbkdf2Sync(password, salt, 10000, 512, 'sha512')
      .toString('hex');
    return userHash === hash;
  }

  private login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
