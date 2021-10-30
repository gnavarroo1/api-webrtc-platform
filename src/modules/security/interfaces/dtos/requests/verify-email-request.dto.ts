import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class VerifyEmailRequestDto {
  @IsNotEmpty()
  @IsEmail(
    {},
    {
      message: 'Invalid email',
    },
  )
  @MaxLength(100)
  readonly email: string;
  @IsNotEmpty()
  @Length(8, 50)
  @IsAlphanumeric()
  @IsString()
  readonly username: string;
}
