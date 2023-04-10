import {IsInt, IsNotEmpty, IsString, isString} from 'class-validator';

export class getUserDto {
    @IsNotEmpty()
    @IsString()
    searchParam: string;
}

export class actionUserDto {
    @IsNotEmpty()
    @IsString()
    user: string;

    @IsNotEmpty()
    @IsString()
    action: string;
}

export class markersDto {
    @IsNotEmpty()
    @IsInt()
    id: number;
}

export class logsDto {
    @IsNotEmpty()
    @IsString()
    id: string;
}