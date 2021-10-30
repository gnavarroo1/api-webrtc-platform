import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class ForgotPasswordRequestDto {
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
