import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { UpdateStockDto } from './dto/update-stock.dto';
import { StockAdjustmentDto, StockAdjustmentOperation } from './dto/stock-adjustment.dto';
import { StockQueryDto } from './dto/stock-query.dto';
import { ProductStockInfo, StockSummaryReport } from './interfaces/stock.interface';
import { StockSummary } from './entities/stock-summary.entity';
import { StockStatus } from '@prisma/client';
import {
  StockNotFoundException,
  InsufficientStockException,
  InvalidStockOperationException,
  StockUpdateFailedException,
  InvalidStockLevelsException,
} from '../common/exceptions';

@Injectable()
export class StockService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  async getProductStock(productId: string): Promise<ProductStockInfo> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        stockQuantity: true,
        minStockLevel: true,
        maxStockLevel: true,
        stockStatus: true,
        lastStockUpdate: true,
        category: true,
        isActive: true,
        price: true,
      },
    });

    if (!product) {
      throw new StockNotFoundException();
    }

    return {
      id: product.id,
      name: product.name,
      stockQuantity: product.stockQuantity,
      minStockLevel: product.minStockLevel,
      maxStockLevel: product.maxStockLevel,
      stockStatus: product.stockStatus,
      lastStockUpdate: product.lastStockUpdate,
      category: product.category,
      isActive: product.isActive,
    };
  }

  async updateStock(productId: string, updateStockDto: UpdateStockDto) {
    // Verificar se o produto existe
    await this.productsService.findOne(productId);

    // Validar níveis de estoque
    if (
      updateStockDto.minStockLevel !== undefined &&
      updateStockDto.maxStockLevel !== undefined &&
      updateStockDto.minStockLevel > updateStockDto.maxStockLevel
    ) {
      throw new InvalidStockLevelsException();
    }

    // Determinar status automático se não fornecido
    const stockStatus = updateStockDto.stockStatus || 
      this.calculateStockStatus(
        updateStockDto.stockQuantity,
        updateStockDto.minStockLevel
      );

    try {
      const updatedProduct = await this.prisma.product.update({
        where: { id: productId },
        data: {
          stockQuantity: updateStockDto.stockQuantity,
          minStockLevel: updateStockDto.minStockLevel,
          maxStockLevel: updateStockDto.maxStockLevel,
          stockStatus,
          lastStockUpdate: new Date(),
        },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          promotions: { where: { isActive: true } },
        },
      });

      return updatedProduct;
    } catch (error) {
      throw new StockUpdateFailedException();
    }
  }

  async adjustStock(productId: string, adjustment: StockAdjustmentDto) {
    // Buscar produto com campos de estoque
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        stockQuantity: true,
        minStockLevel: true,
        isActive: true,
      },
    });

    if (!product) {
      throw new StockNotFoundException();
    }
    
    let newQuantity: number;
    
    switch (adjustment.operation) {
      case StockAdjustmentOperation.INCREASE:
        newQuantity = product.stockQuantity + adjustment.quantity;
        break;
      case StockAdjustmentOperation.DECREASE:
        newQuantity = Math.max(0, product.stockQuantity - adjustment.quantity);
        if (product.stockQuantity < adjustment.quantity) {
          throw new InsufficientStockException(product.stockQuantity, adjustment.quantity);
        }
        break;
      case StockAdjustmentOperation.SET:
        newQuantity = adjustment.quantity;
        break;
      default:
        throw new InvalidStockOperationException();
    }

    const newStatus = this.calculateStockStatus(newQuantity, product.minStockLevel);

    try {
      const updatedProduct = await this.prisma.product.update({
        where: { id: productId },
        data: {
          stockQuantity: newQuantity,
          stockStatus: newStatus,
          lastStockUpdate: new Date(),
        },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          promotions: { where: { isActive: true } },
        },
      });

      return updatedProduct;
    } catch (error) {
      throw new StockUpdateFailedException();
    }
  }

  async getLowStockProducts() {
    return this.prisma.product.findMany({
      where: {
        stockStatus: StockStatus.LOW_STOCK,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        stockQuantity: true,
        minStockLevel: true,
        maxStockLevel: true,
        stockStatus: true,
        lastStockUpdate: true,
        category: true,
        price: true,
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
      orderBy: { stockQuantity: 'asc' },
    });
  }

  async getOutOfStockProducts() {
    return this.prisma.product.findMany({
      where: {
        stockStatus: StockStatus.OUT_OF_STOCK,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        stockQuantity: true,
        minStockLevel: true,
        maxStockLevel: true,
        stockStatus: true,
        lastStockUpdate: true,
        category: true,
        price: true,
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
      orderBy: { lastStockUpdate: 'desc' },
    });
  }

  async getStockSummary(): Promise<StockSummary> {
    const [
      totalProducts,
      inStock,
      lowStock,
      outOfStock,
      discontinued,
      stockValue
    ] = await Promise.all([
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.product.count({ 
        where: { stockStatus: StockStatus.IN_STOCK, isActive: true } 
      }),
      this.prisma.product.count({ 
        where: { stockStatus: StockStatus.LOW_STOCK, isActive: true } 
      }),
      this.prisma.product.count({ 
        where: { stockStatus: StockStatus.OUT_OF_STOCK, isActive: true } 
      }),
      this.prisma.product.count({ 
        where: { stockStatus: StockStatus.DISCONTINUED, isActive: true } 
      }),
      this.prisma.product.aggregate({
        where: { isActive: true },
        _avg: { stockQuantity: true },
        _sum: { stockQuantity: true },
      }),
    ]);

    return new StockSummary({
      totalProducts,
      inStock,
      lowStock,
      outOfStock,
      discontinued,
      averageStockLevel: Number(stockValue._avg.stockQuantity?.toFixed(2)) || 0,
    });
  }

  async getProductsByStockStatus(query: StockQueryDto) {
    const whereCondition: any = {
      isActive: true,
    };

    if (query.status) {
      whereCondition.stockStatus = query.status;
    }

    if (query.lowStockOnly) {
      whereCondition.stockStatus = StockStatus.LOW_STOCK;
    }

    if (query.outOfStockOnly) {
      whereCondition.stockStatus = StockStatus.OUT_OF_STOCK;
    }

    return this.prisma.product.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        stockQuantity: true,
        minStockLevel: true,
        maxStockLevel: true,
        stockStatus: true,
        lastStockUpdate: true,
        category: true,
        price: true,
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
      orderBy: [
        { stockQuantity: 'asc' },
        { lastStockUpdate: 'desc' },
      ],
    });
  }

  private calculateStockStatus(quantity: number, minLevel?: number): StockStatus {
    if (quantity === 0) {
      return StockStatus.OUT_OF_STOCK;
    }
    
    if (minLevel && quantity <= minLevel) {
      return StockStatus.LOW_STOCK;
    }
    
    return StockStatus.IN_STOCK;
  }
}
