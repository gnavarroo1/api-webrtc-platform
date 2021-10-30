import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class ResendConfirmationEmailDto {
  @IsNotEmpty()
  @IsEmail(
    {},
    {
      message: 'Invalid email',
    },
  )
  @MaxLength(100)
  readonly email: string;
}
