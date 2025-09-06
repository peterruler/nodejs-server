import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SigninDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password!: string;
}

