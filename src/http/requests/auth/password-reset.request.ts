import { IsDefined, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

/**
 * Password-reset validation data.
 */
export class PasswordResetRequest {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50, {
    message: 'password is too long. Maximal length is $constraint1 characters, but actual is $value',
  })
  @MinLength(8, {
    message: 'password is too short. Minimal is $constraint1 characters, but actual is $value',
  })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-z]).*$/, {
    message: 'password must contain an uppercase letter, one number and one symbol !@#$%^&*',
  })
  readonly password: string;
}
