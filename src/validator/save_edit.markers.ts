import {IsNotEmpty, IsInt, Matches, IsOptional, IsEmpty} from 'class-validator';
import { Type } from 'class-transformer';

export class markersDto {
    @IsNotEmpty()
    @Matches('^[a-zA-Z]+$')
    server: string;

    @IsNotEmpty()
    @Matches('^[a-zA-Z_]+$')
    id_type: string;

    @IsNotEmpty()
    @Matches('^[a-zA-Z0-9а-яА-Я !_-]+$')
    name: string

    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    x: number;

    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    z: number;

    @IsOptional()
    @IsEmpty()
    description: string;

    @Type(() => Number)
    @IsInt()
    markerID: number;
}