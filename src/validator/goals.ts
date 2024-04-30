import { IsDate, IsInt, IsNotEmpty, IsOptional, IsString, isString } from 'class-validator';

export class saveGoalsDto {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsInt()
  archived: boolean;

  @IsDate()
  endTime: Date;

  @IsNotEmpty()
  @IsInt()
  accum: number;

  @IsNotEmpty()
  @IsInt()
  goal: number;
}
