import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { StockStatus } from '@prisma/client';

export class StockQueryDto {
  @IsOptional()
  @IsEnum(StockStatus)
  status?: StockStatus;

  @IsOptional()
  @IsBoolean()
  lowStockOnly?: boolean;

  @IsOptional()
  @IsBoolean()
  outOfStockOnly?: boolean;
}
