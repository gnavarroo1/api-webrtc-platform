import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserDtoRepository } from '../../infrastructure/repositories/user-dto.repository';
import { UserDto } from '../../interfaces/dtos/user.dto';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from './email.service';
import { ResetPasswordRequestDto } from '../../interfaces/dtos/requests/reset-password-request.dto';
import { VerifyEmailRequestDto } from '../../interfaces/dtos/requests/verify-email-request.dto';
import { UserEntityRepository } from '../../infrastructure/repositories/user-entity.repository';
import { ObjectId } from 'mongodb';
import { ResendConfirmationEmailDto } from '../../interfaces/dtos/requests/resend-confirmation-email.dto';

@Injectable()
export class SecurityService {
  constructor(
    private readonly userDtoRepository: UserDtoRepository,
    private readonly userEntityRepository: UserEntityRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}
  async findOneByUsername(username: string): Promise<UserDto> {
    return this.userDtoRepository
      .findAttr({ username: username })
      .then((user) => {
        if (user) {
          return user;
        }
        throw new HttpException(
          {
            validationMessage: {
              validation: {
                invalid: `User with the username:${username} doesn't exist`,
              },
            },
          },
          HttpStatus.NOT_FOUND,
        );
      });
  }
  async findDuplicate(username: string, email: string): Promise<UserDto[]> {
    return this.userDtoRepository.find({
      $or: [
        {
          username: username,
        },
        {
          email: email,
        },
      ],
    });
  }

  async findOneById(id: string): Promise<UserDto> {
    const user = this.userDtoRepository.findAttr({ _id: id });
    if (user) {
      return user;
    }

    throw new HttpException(
      'User with this id does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async resetPasswordHandler(resetPasswordDto: ResetPasswordRequestDto) {
    return this.userEntityRepository
      .findOneAttr({
        username: resetPasswordDto.username,
      })
      .then((userOrError) => {
        if (userOrError.isFailure) {
          throw new HttpException(
            {
              validationMessage: {
                validation: {
                  invalid: `User ${resetPasswordDto.username} doesn't exist`,
                },
              },
            },
            HttpStatus.NOT_FOUND,
          );
        }
        const user = userOrError.getValue();
        const { salt, hash } = this.getSaltHashPassword(
          resetPasswordDto.password,
        );
        user.salt = salt;
        user.hash = hash;
        return this.userEntityRepository
          .findOneAndReplaceByAttr(
            {
              _id: new ObjectId(user.id),
            },
            user,
          )
          .then((resultOrError) => {
            if (resultOrError.isFailure) {
              throw new HttpException(
                {
                  message: {
                    invalid: `User ${resetPasswordDto.username} doesn't exist`,
                  },
                },
                HttpStatus.NOT_FOUND,
              );
            }
            user.commit();
            return {
              success: true,
              msg: 'Password updated',
            };
          });
      });
  }

  async verifyEmailHandler(verifyEmail: VerifyEmailRequestDto) {
    return this.userEntityRepository
      .findOneAttr({
        username: verifyEmail.username,
        email: verifyEmail.email,
      })
      .then((userOrError) => {
        if (userOrError.isFailure) {
          throw new HttpException(
            {
              validationMessage: {
                validation: {
                  invalid: `User with the email:${verifyEmail.email} doesn't exist`,
                },
              },
            },
            HttpStatus.NOT_FOUND,
          );
        }
        const user = userOrError.getValue();
        user.verified = true;
        return this.userEntityRepository
          .findOneAndReplaceByAttr(
            {
              _id: new ObjectId(user.id),
            },
            user,
          )
          .then((resultOrError) => {
            if (resultOrError.isFailure) {
              throw new HttpException(
                {
                  message: {
                    invalid: `User with the email:${verifyEmail.email} doesn't exist`,
                  },
                },
                HttpStatus.NOT_FOUND,
              );
            }
            user.commit();
            return {
              success: true,
              msg: 'Email verified',
            };
          });
      });
  }

  async forgotPasswordHandler(email: string): Promise<any> {
    return this.userDtoRepository.findAttr({ email: email }).then((user) => {
      if (user) {
        const token = this.jwtService.sign(
          {
            username: user.username,
            email: user.email,
            id: user._id,
          },
          {
            secret: this.configService.get('email.secret'),
            expiresIn: `${this.configService.get('email.expiresIn')}s`,
          },
        );
        const url = `${this.configService.get(
          'email.emailForgotPasswordUrl',
        )}?token=${token}`;
        const text = `Welcome. If you've lost your password or wish to reset it click here: ${url}`;
        return this.emailService
          .sendMail({
            to: user.email,
            subject: 'Reset password',
            text,
          })
          .then(() => {
            return {
              success: true,
              msg: 'Email sent.',
            };
          });
      } else {
        throw new HttpException(
          {
            validationMessage: {
              validation: {
                invalid: `User with the email:${email} doesn't exist`,
              },
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }
    });
  }

  async reSendVerificationEmail(verification: ResendConfirmationEmailDto) {
    return this.userDtoRepository
      .findAttr({ email: verification.email })
      .then((user) => {
        if (user) {
          const token = this.jwtService.sign(
            {
              username: user.username,
              email: user.email,
              id: user._id,
            },
            {
              secret: this.configService.get('email.secret'),
              expiresIn: `${this.configService.get('email.expiresIn')}s`,
            },
          );
          if (user.verified) {
            return {
              success: true,
              msg: 'This email is already verified.',
            };
          }
          const url = `${this.configService.get(
            'email.emailConfirmationUrl',
          )}?token=${token}`;
          const text = `Welcome. To confirm the email address, click here: ${url}`;
          return this.emailService
            .sendMail({
              to: verification.email,
              subject: 'Email confirmation',
              text,
            })
            .then(() => {
              return {
                success: true,
                msg: 'Email sent. Please check your email for email confirmation.',
              };
            });
        } else {
          throw new HttpException(
            {
              validationMessage: {
                validation: {
                  invalid: `User with the email:${verification.email} doesn't exist`,
                },
              },
            },
            HttpStatus.NOT_FOUND,
          );
        }
      });
  }

  validatePassword(password: string, hash: string, salt: string): boolean {
    const tmpHash = crypto
      .pbkdf2Sync(
        password,
        salt,
        this.configService.get<number>('crypto.iterations'),
        this.configService.get<number>('crypto.keylen'),
        this.configService.get<string>('crypto.digest'),
      )
      .toString('hex');
    return hash === tmpHash;
  }
  getSaltHashPassword(password): { salt: string; hash: string } {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(
        password,
        salt,
        this.configService.get<number>('crypto.iterations'),
        this.configService.get<number>('crypto.keylen'),
        this.configService.get<string>('crypto.digest'),
      )
      .toString('hex');
    return {
      hash: hash,
      salt: salt,
    };
  }
}
