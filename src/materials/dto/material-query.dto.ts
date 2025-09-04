import { IsOptional, IsString, IsInt, IsDecimal, IsDateString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class MaterialQueryDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  lowStockOnly?: boolean;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  minQuantity?: number;

  @IsOptional()
  @IsDateString()
  purchaseDateFrom?: string;

  @IsOptional()
  @IsDateString()
  purchaseDateTo?: string;

  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'type' | 'quantity' | 'purchaseDate' | 'totalCost' = 'name';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';
}
