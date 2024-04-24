import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class galleryDto {
  @IsOptional()
  @IsInt()
  id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsString()
  visit: string;

  @IsString()
  world: string;

  @IsString()
  branch: string;

  @Type(() => Number)
  @IsInt()
  coordinates: number;

  @IsNotEmpty()
  @Type(() => String)
  @IsString({ each: true })
  links: string[];
}

export class deleteAproveRejectGalleryDto {
  @IsNotEmpty()
  @IsInt()
  id: number;
}
