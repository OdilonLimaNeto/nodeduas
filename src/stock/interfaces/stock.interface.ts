import { StockStatus } from '@prisma/client';

export interface ProductStockInfo {
  id: string;
  name: string;
  stockQuantity: number;
  minStockLevel?: number | null;
  maxStockLevel?: number | null;
  stockStatus: StockStatus;
  lastStockUpdate?: Date | null;
  category: string;
  isActive: boolean;
}

export interface StockSummaryReport {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  discontinued: number;
  averageStockLevel: number;
}
