import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateUserRequest {
  @IsNotEmpty()
  @Length(8, 50)
  @IsAlphanumeric()
  @IsString()
  readonly username: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  readonly email: string;

  @IsNotEmpty()
  @Matches(/[^0-9_!¡?÷¿\/\\+=@#$%ˆ¨&*(){}|~<>;:\[\]]$/, {
    message: 'firstname must have valid characters',
  })
  @Length(2, 250)
  readonly firstName: string;

  @IsNotEmpty()
  @Length(2, 250)
  @Matches(/[^0-9_!¡?÷¿\/\\+=@#$%ˆ¨&*(){}|~<>;:\[\]]$/, {
    message: 'lastname must have valid characters',
  })
  readonly lastName: string;

  @IsNotEmpty()
  @Length(8, 250)
  @IsString()
  password: string;
}
