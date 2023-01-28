import {IsNotEmpty, IsString} from 'class-validator';

export class getUserDto {
    @IsNotEmpty()
    @IsString()
    searchParam: string;
}