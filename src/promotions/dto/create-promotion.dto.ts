import { IsString, IsOptional, IsInt, IsBoolean, IsDateString, Min, Max } from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  productId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  discountPercentage?: number;

  @IsOptional()
  @IsBoolean()
  isHeroPromotion?: boolean = false;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
