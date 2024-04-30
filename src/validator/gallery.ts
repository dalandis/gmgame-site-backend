import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export class galleryDto {
  @IsOptional()
  @IsInt()
  id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsArray()
  description: object[];

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
