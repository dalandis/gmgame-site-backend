import { IsOptional, IsNotEmpty, IsString, IsNumberString, MaxLength, Matches } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @MaxLength(16)
    @Matches('^[a-zA-Z0-9_]+$')
    login: string;

    @IsNotEmpty()
    password: string

    @IsNotEmpty()
    @IsNumberString()
    type: string;

    @IsNotEmpty()
    @IsNumberString()
    age: string;

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
    password: string
}