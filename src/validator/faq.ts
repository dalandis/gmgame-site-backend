import { IsDate, IsInt, IsNotEmpty, IsOptional, IsString, isString } from 'class-validator';

export class saveFaqDto {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsNotEmpty()
  @IsString()
  quest: string;

  @IsNotEmpty()
  answer: object;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsOptional()
  show?: boolean;
}
