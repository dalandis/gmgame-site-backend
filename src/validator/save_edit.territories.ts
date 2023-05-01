import {IsNotEmpty, IsInt, Matches, IsString} from 'class-validator';
import { Type } from 'class-transformer';

export class territoriesDto {
    @IsNotEmpty()
    @Matches('^[a-zA-Z-]+$')
    server: string;

    @IsNotEmpty()
    @IsString()
    name: string

    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    startX: number;

    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    stopX: number;

    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    startZ: number;

    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    stopZ: number;

    @Type(() => Number)
    @IsInt()
    terrID: number;
}