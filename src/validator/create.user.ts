import { Type } from 'class-transformer';
import { IsOptional, IsNotEmpty, IsString, MaxLength, Matches, IsInt } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @MaxLength(16)
  @Matches('^[a-zA-Z0-9_]+$')
  login: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  type: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  age: number;

  @IsNotEmpty()
  @IsString()
  from_about: string;

  @IsNotEmpty()
  @IsString()
  you_about: string;

  @IsNotEmpty()
  @IsString()
  servers: string;

  @IsOptional()
  @IsString()
  friend_name: string;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  password: string;
}
