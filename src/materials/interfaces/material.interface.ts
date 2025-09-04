import { Decimal } from '@prisma/client/runtime/library';

export interface MaterialInfo {
  id: string;
  name: string;
  type: string;
  brand?: string | null;
  color?: string | null;
  quantity: number;
  unitPrice?: Decimal | null;
  totalCost?: Decimal | null;
  supplier?: string | null;
  purchaseDate?: Date | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialWithFinancials extends MaterialInfo {
  financialRecords: Array<{
    id: string;
    type: string;
    amount: Decimal;
    date: Date;
    description: string;
  }>;
}

export interface MaterialStatsReport {
  materialsByType: Record<string, number>;
  materialsBySupplier: Record<string, number>;
  totalInventoryValue: number;
  averageUnitPrice: number;
  lowStockCount: number;
}
