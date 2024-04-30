import { IsNotEmpty, IsInt, Matches, IsOptional, IsEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class markersDto {
  @IsNotEmpty()
  @Matches('^[a-zA-Z]+$')
  server: string;

  @IsNotEmpty()
  @Matches('^[a-zA-Z_]+$')
  id_type: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  x: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  z: number;

  @IsOptional()
  @IsNotEmpty()
  description: string;

  @Type(() => Number)
  @IsInt()
  markerID: number;
}
