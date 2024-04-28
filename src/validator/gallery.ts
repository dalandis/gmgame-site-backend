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
