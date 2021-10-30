import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ResetPasswordRequestDto {
  @IsNotEmpty()
  readonly username: string;
  @IsNotEmpty()
  @Length(8, 250)
  @IsString()
  readonly password: string;
}
