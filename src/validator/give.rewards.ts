import { IsNotEmpty, IsInt, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class rewardsDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  rewardId: number;
}
