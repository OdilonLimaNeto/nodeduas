export class FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  transactionCount: number;
  avgTransactionValue: number;
  revenueByCategory: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
  expensesByCategory: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    revenue: number;
    expenses: number;
    net: number;
  }>;

  constructor(data: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    transactionCount: number;
    avgTransactionValue: number;
    revenueByCategory: Array<{
      category: string;
      amount: number;
      count: number;
    }>;
    expensesByCategory: Array<{
      category: string;
      amount: number;
      count: number;
    }>;
    monthlyTrend: Array<{
      month: string;
      revenue: number;
      expenses: number;
      net: number;
    }>;
  }) {
    this.totalRevenue = data.totalRevenue;
    this.totalExpenses = data.totalExpenses;
    this.netIncome = data.netIncome;
    this.transactionCount = data.transactionCount;
    this.avgTransactionValue = data.avgTransactionValue;
    this.revenueByCategory = data.revenueByCategory;
    this.expensesByCategory = data.expensesByCategory;
    this.monthlyTrend = data.monthlyTrend;
  }
}
