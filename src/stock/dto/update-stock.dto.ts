import { IsOptional, IsInt, IsEnum, Min } from 'class-validator';
import { StockStatus } from '@prisma/client';

export class UpdateStockDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minStockLevel?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxStockLevel?: number;

  @IsOptional()
  @IsEnum(StockStatus)
  stockStatus?: StockStatus;
}
