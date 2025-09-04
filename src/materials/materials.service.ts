import { Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MaterialQueryDto } from './dto/material-query.dto';
import { MaterialAdjustmentDto, MaterialAdjustmentOperation } from './dto/material-adjustment.dto';
import { MaterialSummary } from './entities/material-summary.entity';
import { MaterialInfo, MaterialWithFinancials } from './interfaces/material.interface';
import {
  MaterialNotFoundException,
  MaterialAlreadyExistsException,
  InvalidMaterialDataException,
  MaterialUpdateFailedException,
  InvalidMaterialQuantityException,
  InsufficientMaterialException,
} from '../common/exceptions';

@Injectable()
export class MaterialsService {
  constructor(private prisma: PrismaService) {}

  async create(createMaterialDto: CreateMaterialDto): Promise<MaterialInfo> {
    // Verificar se já existe material com o mesmo nome
    const existingMaterial = await this.prisma.material.findFirst({
      where: { name: createMaterialDto.name },
    });

    if (existingMaterial) {
      throw new MaterialAlreadyExistsException();
    }

    // Calcular totalCost se não fornecido
    let totalCost = createMaterialDto.totalCost;
    if (!totalCost && createMaterialDto.unitPrice && createMaterialDto.quantity) {
      totalCost = createMaterialDto.unitPrice * createMaterialDto.quantity;
    }

    try {
      const material = await this.prisma.material.create({
        data: {
          name: createMaterialDto.name,
          type: createMaterialDto.type,
          brand: createMaterialDto.brand,
          color: createMaterialDto.color,
          quantity: createMaterialDto.quantity || 0,
          unitPrice: createMaterialDto.unitPrice,
          totalCost,
          supplier: createMaterialDto.supplier,
          purchaseDate: createMaterialDto.purchaseDate ? new Date(createMaterialDto.purchaseDate) : null,
          notes: createMaterialDto.notes,
        },
      });

      return material;
    } catch (error) {
      throw new MaterialUpdateFailedException();
    }
  }

  async findAll(query?: MaterialQueryDto): Promise<MaterialInfo[]> {
    const whereCondition: any = {};

    if (query) {
      if (query.type) whereCondition.type = { contains: query.type, mode: 'insensitive' };
      if (query.brand) whereCondition.brand = { contains: query.brand, mode: 'insensitive' };
      if (query.color) whereCondition.color = { contains: query.color, mode: 'insensitive' };
      if (query.supplier) whereCondition.supplier = { contains: query.supplier, mode: 'insensitive' };
      if (query.minQuantity) whereCondition.quantity = { gte: query.minQuantity };
      if (query.lowStockOnly) whereCondition.quantity = { lte: 10 }; // Consideramos baixo estoque <= 10

      if (query.purchaseDateFrom || query.purchaseDateTo) {
        whereCondition.purchaseDate = {};
        if (query.purchaseDateFrom) whereCondition.purchaseDate.gte = new Date(query.purchaseDateFrom);
        if (query.purchaseDateTo) whereCondition.purchaseDate.lte = new Date(query.purchaseDateTo);
      }
    }

    const orderBy: any = {};
    if (query?.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'asc';
    } else {
      orderBy.name = 'asc';
    }

    return this.prisma.material.findMany({
      where: whereCondition,
      orderBy,
    });
  }

  async findOne(id: string): Promise<MaterialInfo> {
    const material = await this.prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      throw new MaterialNotFoundException();
    }

    return material;
  }

  async findOneWithFinancials(id: string): Promise<MaterialWithFinancials> {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: {
        financialRecords: {
          select: {
            id: true,
            type: true,
            amount: true,
            date: true,
            description: true,
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!material) {
      throw new MaterialNotFoundException();
    }

    return material;
  }

  async update(id: string, updateMaterialDto: UpdateMaterialDto): Promise<MaterialInfo> {
    await this.findOne(id); // Verificar se existe

    // Recalcular totalCost se necessário
    let totalCost = updateMaterialDto.totalCost;
    if (!totalCost && updateMaterialDto.unitPrice !== undefined && updateMaterialDto.quantity !== undefined) {
      totalCost = updateMaterialDto.unitPrice * updateMaterialDto.quantity;
    }

    try {
      const material = await this.prisma.material.update({
        where: { id },
        data: {
          ...updateMaterialDto,
          totalCost,
          purchaseDate: updateMaterialDto.purchaseDate ? new Date(updateMaterialDto.purchaseDate) : undefined,
        },
      });

      return material;
    } catch (error) {
      throw new MaterialUpdateFailedException();
    }
  }

  async adjustQuantity(id: string, adjustment: MaterialAdjustmentDto): Promise<MaterialInfo> {
    const material = await this.findOne(id);
    
    let newQuantity: number;
    
    switch (adjustment.operation) {
      case MaterialAdjustmentOperation.INCREASE:
        newQuantity = material.quantity + adjustment.quantity;
        break;
      case MaterialAdjustmentOperation.DECREASE:
        if (material.quantity < adjustment.quantity) {
          throw new InsufficientMaterialException(material.quantity, adjustment.quantity);
        }
        newQuantity = material.quantity - adjustment.quantity;
        break;
      case MaterialAdjustmentOperation.SET:
        newQuantity = adjustment.quantity;
        break;
      default:
        throw new InvalidMaterialQuantityException();
    }

    // Recalcular totalCost se temos unitPrice
    let totalCost = material.totalCost;
    if (material.unitPrice) {
      totalCost = material.unitPrice.mul(newQuantity);
    }

    try {
      const updatedMaterial = await this.prisma.material.update({
        where: { id },
        data: {
          quantity: newQuantity,
          totalCost,
        },
      });

      return updatedMaterial;
    } catch (error) {
      throw new MaterialUpdateFailedException();
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Verificar se existe

    try {
      await this.prisma.material.delete({
        where: { id },
      });
    } catch (error) {
      throw new MaterialUpdateFailedException();
    }
  }

  async getLowStockMaterials(threshold: number = 10): Promise<MaterialInfo[]> {
    return this.prisma.material.findMany({
      where: {
        quantity: { lte: threshold },
      },
      orderBy: { quantity: 'asc' },
    });
  }

  async getMaterialsByType(): Promise<Record<string, MaterialInfo[]>> {
    const materials = await this.prisma.material.findMany({
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    return materials.reduce((acc, material) => {
      if (!acc[material.type]) {
        acc[material.type] = [];
      }
      acc[material.type].push(material);
      return acc;
    }, {} as Record<string, MaterialInfo[]>);
  }

  async getMaterialsBySupplier(): Promise<Record<string, MaterialInfo[]>> {
    const materials = await this.prisma.material.findMany({
      where: { supplier: { not: null } },
      orderBy: [{ supplier: 'asc' }, { name: 'asc' }],
    });

    return materials.reduce((acc, material) => {
      const supplier = material.supplier || 'Unknown';
      if (!acc[supplier]) {
        acc[supplier] = [];
      }
      acc[supplier].push(material);
      return acc;
    }, {} as Record<string, MaterialInfo[]>);
  }

  async getSummary(): Promise<MaterialSummary> {
    const [
      totalMaterials,
      lowStockMaterials,
      totalValueResult,
      allMaterials
    ] = await Promise.all([
      this.prisma.material.count(),
      this.prisma.material.count({ where: { quantity: { lte: 10 } } }),
      this.prisma.material.aggregate({
        _sum: { totalCost: true },
      }),
      this.prisma.material.findMany({
        select: {
          supplier: true,
          type: true,
          totalCost: true,
        },
      }),
    ]);

    // Process supplier stats
    const supplierMap = new Map<string, { count: number; value: number }>();
    const typeMap = new Map<string, { count: number; value: number }>();

    allMaterials.forEach(material => {
      const supplier = material.supplier || 'Unknown';
      const type = material.type;
      const value = Number(material.totalCost) || 0;

      // Supplier stats
      if (!supplierMap.has(supplier)) {
        supplierMap.set(supplier, { count: 0, value: 0 });
      }
      const supplierStat = supplierMap.get(supplier)!;
      supplierStat.count++;
      supplierStat.value += value;

      // Type stats
      if (!typeMap.has(type)) {
        typeMap.set(type, { count: 0, value: 0 });
      }
      const typeStat = typeMap.get(type)!;
      typeStat.count++;
      typeStat.value += value;
    });

    const topSuppliers = Array.from(supplierMap.entries())
      .map(([supplier, stats]) => ({
        supplier,
        materialsCount: stats.count,
        totalValue: stats.value,
      }))
      .sort((a, b) => b.materialsCount - a.materialsCount)
      .slice(0, 5);

    const materialsbyType = Array.from(typeMap.entries())
      .map(([type, stats]) => ({
        type,
        count: stats.count,
        totalValue: stats.value,
      }))
      .sort((a, b) => b.count - a.count);

    return new MaterialSummary({
      totalMaterials,
      totalValue: Number(totalValueResult._sum.totalCost) || 0,
      lowStockMaterials,
      topSuppliers,
      materialsbyType,
    });
  }
}
