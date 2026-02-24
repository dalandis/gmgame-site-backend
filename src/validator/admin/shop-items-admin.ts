import {
  IsDefined,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  Min,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Type } from 'class-transformer';

@ValidatorConstraint({ name: 'isPlainJsonObject', async: false })
class IsPlainJsonObjectConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  defaultMessage(): string {
    return 'enchantments must be a JSON object';
  }
}

class shopItemPayloadDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsIn(['item'])
  type: 'item';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  amount: number;

  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @Validate(IsPlainJsonObjectConstraint)
  enchantments: Record<string, any>;

  @IsNotEmpty()
  @IsString()
  gameId: string;

  @IsNotEmpty()
  @IsString()
  gameLegend: string;
}

export class shopItemCreateDto extends shopItemPayloadDto {}

export class shopItemUpdateDto extends shopItemPayloadDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}

export class shopItemDeleteDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}
