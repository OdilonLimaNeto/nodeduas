export class StockSummary {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  discontinued: number;
  averageStockLevel: number;

  constructor(data: {
    totalProducts: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    discontinued: number;
    averageStockLevel: number;
  }) {
    this.totalProducts = data.totalProducts;
    this.inStock = data.inStock;
    this.lowStock = data.lowStock;
    this.outOfStock = data.outOfStock;
    this.discontinued = data.discontinued;
    this.averageStockLevel = data.averageStockLevel;
  }
}
