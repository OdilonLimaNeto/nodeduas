export class MaterialSummary {
  totalMaterials: number;
  totalValue: number;
  lowStockMaterials: number;
  topSuppliers: Array<{
    supplier: string;
    materialsCount: number;
    totalValue: number;
  }>;
  materialsbyType: Array<{
    type: string;
    count: number;
    totalValue: number;
  }>;

  constructor(data: {
    totalMaterials: number;
    totalValue: number;
    lowStockMaterials: number;
    topSuppliers: Array<{
      supplier: string;
      materialsCount: number;
      totalValue: number;
    }>;
    materialsbyType: Array<{
      type: string;
      count: number;
      totalValue: number;
    }>;
  }) {
    this.totalMaterials = data.totalMaterials;
    this.totalValue = data.totalValue;
    this.lowStockMaterials = data.lowStockMaterials;
    this.topSuppliers = data.topSuppliers;
    this.materialsbyType = data.materialsbyType;
  }
}
