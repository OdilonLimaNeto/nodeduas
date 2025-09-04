import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PromotionQueryDto } from './dto/promotion-query.dto';
import { PromotionSummary } from './entities/promotion-summary.entity';
import {
  PromotionNotFoundException,
  PromotionAlreadyExistsException,
  InvalidPromotionDataException,
  PromotionUpdateFailedException,
  InvalidPromotionDatesException,
  PromotionExpiredException,
} from '../common/exceptions';

@Injectable()
export class PromotionsService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  async create(createPromotionDto: CreatePromotionDto) {
    // Verificar se o produto existe
    await this.productsService.findOne(createPromotionDto.productId);

    // Validar datas se fornecidas
    if (createPromotionDto.startDate && createPromotionDto.endDate) {
      const startDate = new Date(createPromotionDto.startDate);
      const endDate = new Date(createPromotionDto.endDate);
      
      if (endDate <= startDate) {
        throw new InvalidPromotionDatesException();
      }
    }

    // Verificar se já existe uma promoção ativa com o mesmo título para o produto
    const existingPromotion = await this.prisma.promotion.findFirst({
      where: {
        productId: createPromotionDto.productId,
        title: createPromotionDto.title,
        isActive: true,
      },
    });

    if (existingPromotion) {
      throw new PromotionAlreadyExistsException();
    }

    try {
      const promotion = await this.prisma.promotion.create({
        data: {
          ...createPromotionDto,
          startDate: createPromotionDto.startDate ? new Date(createPromotionDto.startDate) : new Date(),
          endDate: createPromotionDto.endDate ? new Date(createPromotionDto.endDate) : null,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              category: true,
            },
          },
        },
      });

      return promotion;
    } catch (error) {
      throw new InvalidPromotionDataException();
    }
  }

  async findAll(query?: PromotionQueryDto) {
    const whereCondition: any = {};

    if (query?.activeOnly) {
      whereCondition.isActive = true;
    }

    if (query?.heroOnly) {
      whereCondition.isHeroPromotion = true;
    }

    if (!query?.includeExpired) {
      whereCondition.OR = [
        { endDate: null },
        { endDate: { gte: new Date() } },
      ];
    }

    if (query?.fromDate) {
      whereCondition.startDate = {
        ...whereCondition.startDate,
        gte: new Date(query.fromDate),
      };
    }

    if (query?.toDate) {
      whereCondition.endDate = {
        ...whereCondition.endDate,
        lte: new Date(query.toDate),
      };
    }

    return this.prisma.promotion.findMany({
      where: whereCondition,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            category: true,
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
          },
        },
      },
      orderBy: [
        { isHeroPromotion: 'desc' },
        { startDate: 'desc' },
      ],
    });
  }

  async findOne(id: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            originalPrice: true,
            category: true,
            rating: true,
            reviewCount: true,
            images: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!promotion) {
      throw new PromotionNotFoundException();
    }

    return promotion;
  }

  async findByProduct(productId: string) {
    // Verificar se o produto existe
    await this.productsService.findOne(productId);

    return this.prisma.promotion.findMany({
      where: { 
        productId,
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } },
        ],
      },
      orderBy: [
        { isHeroPromotion: 'desc' },
        { startDate: 'desc' },
      ],
    });
  }

  async getActivePromotions() {
    return this.prisma.promotion.findMany({
      where: {
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } },
        ],
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            category: true,
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
          },
        },
      },
      orderBy: [
        { isHeroPromotion: 'desc' },
        { startDate: 'desc' },
      ],
    });
  }

  async getHeroPromotions() {
    return this.prisma.promotion.findMany({
      where: {
        isHeroPromotion: true,
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } },
        ],
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            originalPrice: true,
            category: true,
            rating: true,
            reviewCount: true,
            images: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async update(id: string, updatePromotionDto: UpdatePromotionDto) {
    const promotion = await this.findOne(id);

    // Verificar se a promoção expirou
    if (promotion.endDate && promotion.endDate < new Date()) {
      throw new PromotionExpiredException();
    }

    // Validar datas se fornecidas
    if (updatePromotionDto.startDate && updatePromotionDto.endDate) {
      const startDate = new Date(updatePromotionDto.startDate);
      const endDate = new Date(updatePromotionDto.endDate);
      
      if (endDate <= startDate) {
        throw new InvalidPromotionDatesException();
      }
    }

    // Se está mudando o produto, verificar se o novo produto existe
    if (updatePromotionDto.productId && updatePromotionDto.productId !== promotion.productId) {
      await this.productsService.findOne(updatePromotionDto.productId);
    }

    try {
      const updatedPromotion = await this.prisma.promotion.update({
        where: { id },
        data: {
          ...updatePromotionDto,
          startDate: updatePromotionDto.startDate ? new Date(updatePromotionDto.startDate) : undefined,
          endDate: updatePromotionDto.endDate ? new Date(updatePromotionDto.endDate) : undefined,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              category: true,
            },
          },
        },
      });

      return updatedPromotion;
    } catch (error) {
      throw new PromotionUpdateFailedException();
    }
  }

  async activate(id: string) {
    const promotion = await this.findOne(id);

    if (promotion.endDate && promotion.endDate < new Date()) {
      throw new PromotionExpiredException();
    }

    return this.prisma.promotion.update({
      where: { id },
      data: { isActive: true },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            category: true,
          },
        },
      },
    });
  }

  async deactivate(id: string) {
    await this.findOne(id);

    return this.prisma.promotion.update({
      where: { id },
      data: { isActive: false },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            category: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.promotion.delete({
      where: { id },
    });
  }

  async getPromotionsSummary(): Promise<PromotionSummary> {
    const now = new Date();

    const [
      totalPromotions,
      activePromotions,
      expiredPromotions,
      heroPromotions,
      discountAverage,
      topPromotedProducts
    ] = await Promise.all([
      this.prisma.promotion.count(),
      this.prisma.promotion.count({
        where: {
          isActive: true,
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      }),
      this.prisma.promotion.count({
        where: {
          endDate: { lt: now },
        },
      }),
      this.prisma.promotion.count({
        where: {
          isHeroPromotion: true,
          isActive: true,
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      }),
      this.prisma.promotion.aggregate({
        where: {
          discountPercentage: { not: null },
          isActive: true,
        },
        _avg: { discountPercentage: true },
      }),
      this.prisma.promotion.findMany({
        where: {
          isActive: true,
          discountPercentage: { not: null },
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { discountPercentage: 'desc' },
        take: 5,
      }),
    ]);

    return new PromotionSummary({
      totalPromotions,
      activePromotions,
      expiredPromotions,
      heroPromotions,
      averageDiscountPercentage: Number(discountAverage._avg.discountPercentage?.toFixed(2)) || 0,
      topPromotedProducts: topPromotedProducts.map(promotion => ({
        productId: promotion.product.id,
        productName: promotion.product.name,
        promotionTitle: promotion.title,
        discountPercentage: promotion.discountPercentage || 0,
      })),
    });
  }
}
