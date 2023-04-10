import {IsInt, IsNotEmpty, IsOptional, IsString, isString} from 'class-validator';

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

export class markersUpdateDto {
    @IsNotEmpty()
    @IsInt()
    id: number;

    @IsOptional()
    @IsString()
    id_type?: string;

    @IsOptional()
    @IsInt()
    x?: number;

    @IsOptional()
    @IsInt()
    y?: number;

    @IsOptional()
    @IsInt()
    z?: number;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;
}

export class terrUpdateDto {
    @IsNotEmpty()
    @IsInt()
    id: number;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    world?: string;

    @IsOptional()
    @IsInt()
    xStart?: number;

    @IsOptional()
    @IsInt()
    xStop?: number;

    @IsOptional()
    @IsInt()
    zStart?: number;

    @IsOptional()
    @IsInt()
    zStop?: number;
}