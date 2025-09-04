import { IsInt, IsString, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export enum MaterialAdjustmentOperation {
  INCREASE = 'increase',
  DECREASE = 'decrease',
  SET = 'set',
}

export class MaterialAdjustmentDto {
  @IsString()
  operation: MaterialAdjustmentOperation;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  quantity: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
