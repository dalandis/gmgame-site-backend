import { IsNotEmpty, IsInt, IsString, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class galleryDto {
    @IsNotEmpty()
    @IsArray()
    url: string[]

    @IsNotEmpty()
    @IsString()
    title: string

    @IsNotEmpty()
    @IsString()
    description: string

    @IsString()
    authors: string

    @IsString()
    tags: string

    @IsNotEmpty()
    @IsBoolean()
    check: boolean

    @Type(() => Number)
    @IsInt()
    galleryID: number;
}