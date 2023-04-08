import {IsInt, IsNotEmpty, IsString} from 'class-validator';

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