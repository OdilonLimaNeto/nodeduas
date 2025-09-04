import { Decimal } from '@prisma/client/runtime/library';

export interface FinancialRecordInfo {
  id: string;
  type: string;
  category: string;
  description: string;
  amount: Decimal;
  date: Date;
  paymentMethod?: string | null;
  notes?: string | null;
  productId?: string | null;
  materialId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialRecordWithRelations extends FinancialRecordInfo {
  product?: {
    id: string;
    name: string;
    category: string;
  } | null;
  material?: {
    id: string;
    name: string;
    type: string;
  } | null;
}

export interface FinancialReport {
  period: {
    start: Date;
    end: Date;
  };
  totals: {
    revenue: number;
    expenses: number;
    net: number;
  };
  categories: {
    revenue: Record<string, number>;
    expenses: Record<string, number>;
  };
  trends: Array<{
    period: string;
    revenue: number;
    expenses: number;
    net: number;
  }>;
}
