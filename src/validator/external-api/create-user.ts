import {IsNotEmpty, MaxLength, Matches, IsNumberString, IsString, IsOptional, MinLength, IsInt} from 'class-validator';

class userJson {
    @IsNumberString()
    id: string
}

export class createUserDto {
    @IsNotEmpty()
    @MaxLength(16)
    @Matches('^[a-zA-Z0-9_]+$')
    login: string;

    @IsNotEmpty()
    @MinLength(8)
    password: string

    @IsNotEmpty()
    @IsInt()
    type: number;

    @IsNotEmpty()
    @IsInt()
    age: number;

    @IsNotEmpty()
    @IsString()
    from_about: string;

    @IsNotEmpty()
    @IsString()
    you_about: string;

    @IsOptional()
    @IsString()
    servers: string;

    @IsOptional()
    @IsString()
    friend_name: string;

    @IsNotEmpty()
    user_json: userJson

    @IsOptional()
    @IsString()
    partner: string
}

export class getStatusrDto {
    @IsNotEmpty()
    @IsNumberString()
    user_id: string
}

export class checkUserDto {
    @IsNotEmpty()
    @IsString()
    user: string
}

export class decisionUserDto {
    @IsNotEmpty()
    @IsNumberString()
    user: string
}