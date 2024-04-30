import { IsDate, IsInt, IsNotEmpty, IsOptional, IsString, isString } from 'class-validator';

export class saveFaqDto {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsNotEmpty()
  @IsString()
  quest: string;

  @IsNotEmpty()
  @IsString()
  answer: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsInt()
  show: boolean;
}
