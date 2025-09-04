import { IsString, IsDecimal, IsOptional, IsDateString, IsEnum, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export enum TransactionType {
  ENTRADA = 'entrada',
  SAIDA = 'saida',
}

export class CreateFinancialRecordDto {
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  @MaxLength(100)
  category: string;

  @IsString()
  @MaxLength(500)
  description: string;

  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  materialId?: string;
}
