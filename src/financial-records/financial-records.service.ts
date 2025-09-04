import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFinancialRecordDto, TransactionType } from './dto/create-financial-record.dto';
import { UpdateFinancialRecordDto } from './dto/update-financial-record.dto';
import { FinancialRecordQueryDto } from './dto/financial-record-query.dto';
import { FinancialSummary } from './entities/financial-summary.entity';
import { FinancialRecordInfo, FinancialRecordWithRelations } from './interfaces/financial-record.interface';
import {
  FinancialRecordNotFoundException,
  InvalidFinancialDataException,
  FinancialRecordUpdateFailedException,
  InvalidDateRangeException,
  InvalidAmountException,
  RelatedEntityNotFoundException,
} from '../common/exceptions';

@Injectable()
export class FinancialRecordsService {
  constructor(private prisma: PrismaService) {}

  async create(createFinancialRecordDto: CreateFinancialRecordDto): Promise<FinancialRecordInfo> {
    // Validar amount
    if (createFinancialRecordDto.amount <= 0) {
      throw new InvalidAmountException();
    }

    // Verificar se produto existe (se fornecido)
    if (createFinancialRecordDto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: createFinancialRecordDto.productId },
      });
      if (!product) {
        throw new RelatedEntityNotFoundException('product');
      }
    }

    // Verificar se material existe (se fornecido)
    if (createFinancialRecordDto.materialId) {
      const material = await this.prisma.material.findUnique({
        where: { id: createFinancialRecordDto.materialId },
      });
      if (!material) {
        throw new RelatedEntityNotFoundException('material');
      }
    }

    try {
      const financialRecord = await this.prisma.financialRecord.create({
        data: {
          type: createFinancialRecordDto.type,
          category: createFinancialRecordDto.category,
          description: createFinancialRecordDto.description,
          amount: createFinancialRecordDto.amount,
          date: createFinancialRecordDto.date ? new Date(createFinancialRecordDto.date) : new Date(),
          paymentMethod: createFinancialRecordDto.paymentMethod,
          notes: createFinancialRecordDto.notes,
          productId: createFinancialRecordDto.productId,
          materialId: createFinancialRecordDto.materialId,
        },
      });

      return financialRecord;
    } catch (error) {
      throw new FinancialRecordUpdateFailedException();
    }
  }

  async findAll(query?: FinancialRecordQueryDto): Promise<FinancialRecordInfo[]> {
    const whereCondition: any = {};

    if (query) {
      if (query.type) whereCondition.type = query.type;
      if (query.category) whereCondition.category = { contains: query.category, mode: 'insensitive' };
      if (query.paymentMethod) whereCondition.paymentMethod = { contains: query.paymentMethod, mode: 'insensitive' };
      if (query.productId) whereCondition.productId = query.productId;
      if (query.materialId) whereCondition.materialId = query.materialId;
      if (query.hasProduct !== undefined) {
        whereCondition.productId = query.hasProduct ? { not: null } : null;
      }
      if (query.hasMaterial !== undefined) {
        whereCondition.materialId = query.hasMaterial ? { not: null } : null;
      }

      if (query.minAmount || query.maxAmount) {
        whereCondition.amount = {};
        if (query.minAmount) whereCondition.amount.gte = query.minAmount;
        if (query.maxAmount) whereCondition.amount.lte = query.maxAmount;
      }

      if (query.dateFrom || query.dateTo) {
        whereCondition.date = {};
        if (query.dateFrom) whereCondition.date.gte = new Date(query.dateFrom);
        if (query.dateTo) whereCondition.date.lte = new Date(query.dateTo);

        // Validar range de datas
        if (query.dateFrom && query.dateTo && new Date(query.dateFrom) > new Date(query.dateTo)) {
          throw new InvalidDateRangeException();
        }
      }
    }

    const orderBy: any = {};
    if (query?.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'desc';
    } else {
      orderBy.date = 'desc';
    }

    return this.prisma.financialRecord.findMany({
      where: whereCondition,
      orderBy,
    });
  }

  async findOne(id: string): Promise<FinancialRecordInfo> {
    const financialRecord = await this.prisma.financialRecord.findUnique({
      where: { id },
    });

    if (!financialRecord) {
      throw new FinancialRecordNotFoundException();
    }

    return financialRecord;
  }

  async findOneWithRelations(id: string): Promise<FinancialRecordWithRelations> {
    const financialRecord = await this.prisma.financialRecord.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        material: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    if (!financialRecord) {
      throw new FinancialRecordNotFoundException();
    }

    return financialRecord;
  }

  async update(id: string, updateFinancialRecordDto: UpdateFinancialRecordDto): Promise<FinancialRecordInfo> {
    await this.findOne(id); // Verificar se existe

    // Validar amount se fornecido
    if (updateFinancialRecordDto.amount !== undefined && updateFinancialRecordDto.amount <= 0) {
      throw new InvalidAmountException();
    }

    // Verificar relacionamentos se fornecidos
    if (updateFinancialRecordDto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: updateFinancialRecordDto.productId },
      });
      if (!product) {
        throw new RelatedEntityNotFoundException('product');
      }
    }

    if (updateFinancialRecordDto.materialId) {
      const material = await this.prisma.material.findUnique({
        where: { id: updateFinancialRecordDto.materialId },
      });
      if (!material) {
        throw new RelatedEntityNotFoundException('material');
      }
    }

    try {
      const financialRecord = await this.prisma.financialRecord.update({
        where: { id },
        data: {
          ...updateFinancialRecordDto,
          date: updateFinancialRecordDto.date ? new Date(updateFinancialRecordDto.date) : undefined,
        },
      });

      return financialRecord;
    } catch (error) {
      throw new FinancialRecordUpdateFailedException();
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Verificar se existe

    try {
      await this.prisma.financialRecord.delete({
        where: { id },
      });
    } catch (error) {
      throw new FinancialRecordUpdateFailedException();
    }
  }

  async getRevenue(dateFrom?: string, dateTo?: string): Promise<FinancialRecordInfo[]> {
    const whereCondition: any = {
      type: TransactionType.ENTRADA,
    };

    if (dateFrom || dateTo) {
      whereCondition.date = {};
      if (dateFrom) whereCondition.date.gte = new Date(dateFrom);
      if (dateTo) whereCondition.date.lte = new Date(dateTo);
    }

    return this.prisma.financialRecord.findMany({
      where: whereCondition,
      orderBy: { date: 'desc' },
    });
  }

  async getExpenses(dateFrom?: string, dateTo?: string): Promise<FinancialRecordInfo[]> {
    const whereCondition: any = {
      type: TransactionType.SAIDA,
    };

    if (dateFrom || dateTo) {
      whereCondition.date = {};
      if (dateFrom) whereCondition.date.gte = new Date(dateFrom);
      if (dateTo) whereCondition.date.lte = new Date(dateTo);
    }

    return this.prisma.financialRecord.findMany({
      where: whereCondition,
      orderBy: { date: 'desc' },
    });
  }

  async getSummary(dateFrom?: string, dateTo?: string): Promise<FinancialSummary> {
    const whereCondition: any = {};

    if (dateFrom || dateTo) {
      whereCondition.date = {};
      if (dateFrom) whereCondition.date.gte = new Date(dateFrom);
      if (dateTo) whereCondition.date.lte = new Date(dateTo);
    }

    const [
      revenueTotal,
      expensesTotal,
      totalRecords,
      avgAmount,
      allRecords
    ] = await Promise.all([
      this.prisma.financialRecord.aggregate({
        where: { ...whereCondition, type: TransactionType.ENTRADA },
        _sum: { amount: true },
      }),
      this.prisma.financialRecord.aggregate({
        where: { ...whereCondition, type: TransactionType.SAIDA },
        _sum: { amount: true },
      }),
      this.prisma.financialRecord.count({ where: whereCondition }),
      this.prisma.financialRecord.aggregate({
        where: whereCondition,
        _avg: { amount: true },
      }),
      this.prisma.financialRecord.findMany({
        where: whereCondition,
        select: {
          type: true,
          category: true,
          amount: true,
          date: true,
        },
      }),
    ]);

    const totalRevenue = Number(revenueTotal._sum.amount) || 0;
    const totalExpenses = Number(expensesTotal._sum.amount) || 0;
    const netIncome = totalRevenue - totalExpenses;

    // Processar categorias
    const revenueByCategoryMap = new Map<string, { amount: number; count: number }>();
    const expensesByCategoryMap = new Map<string, { amount: number; count: number }>();
    const monthlyTrendMap = new Map<string, { revenue: number; expenses: number }>();

    allRecords.forEach(record => {
      const amount = Number(record.amount);
      const month = record.date.toISOString().substring(0, 7); // YYYY-MM

      if (record.type === TransactionType.ENTRADA) {
        // Revenue by category
        if (!revenueByCategoryMap.has(record.category)) {
          revenueByCategoryMap.set(record.category, { amount: 0, count: 0 });
        }
        const categoryData = revenueByCategoryMap.get(record.category)!;
        categoryData.amount += amount;
        categoryData.count++;

        // Monthly trend
        if (!monthlyTrendMap.has(month)) {
          monthlyTrendMap.set(month, { revenue: 0, expenses: 0 });
        }
        monthlyTrendMap.get(month)!.revenue += amount;
      } else {
        // Expenses by category
        if (!expensesByCategoryMap.has(record.category)) {
          expensesByCategoryMap.set(record.category, { amount: 0, count: 0 });
        }
        const categoryData = expensesByCategoryMap.get(record.category)!;
        categoryData.amount += amount;
        categoryData.count++;

        // Monthly trend
        if (!monthlyTrendMap.has(month)) {
          monthlyTrendMap.set(month, { revenue: 0, expenses: 0 });
        }
        monthlyTrendMap.get(month)!.expenses += amount;
      }
    });

    const revenueByCategory = Array.from(revenueByCategoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount);

    const expensesByCategory = Array.from(expensesByCategoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount);

    const monthlyTrend = Array.from(monthlyTrendMap.entries())
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        expenses: data.expenses,
        net: data.revenue - data.expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return new FinancialSummary({
      totalRevenue,
      totalExpenses,
      netIncome,
      transactionCount: totalRecords,
      avgTransactionValue: Number(avgAmount._avg.amount) || 0,
      revenueByCategory,
      expensesByCategory,
      monthlyTrend,
    });
  }
}
