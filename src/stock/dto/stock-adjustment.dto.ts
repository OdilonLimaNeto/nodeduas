import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export enum StockAdjustmentOperation {
  INCREASE = 'increase',
  DECREASE = 'decrease',
  SET = 'set',
}

export class StockAdjustmentDto {
  @IsEnum(StockAdjustmentOperation)
  operation: StockAdjustmentOperation;

  @IsInt()
  @Min(0)
  quantity: number;
}
