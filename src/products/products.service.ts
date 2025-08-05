import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ProductNotFoundException,
  ProductAlreadyExistsException,
  InvalidProductDataException,
  ProductUpdateFailedException,
} from '../common/exceptions';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const { name, ...productData } = createProductDto;

    // Check if product with same name already exists
    const existingProduct = await this.prisma.product.findFirst({
      where: { name }
    });

    if (existingProduct) {
      throw new ProductAlreadyExistsException();
    }

    try {
      const product = await this.prisma.product.create({
        data: {
          name,
          ...productData,
        },
        include: {
          images: {
            orderBy: { sortOrder: 'asc' }
          },
          promotions: {
            where: { isActive: true }
          }
        }
      });

      return product;
    } catch (error) {
      throw new InvalidProductDataException();
    }
  }

  async findAll(includeInactive: boolean = false) {
    const whereCondition = includeInactive ? {} : { isActive: true };

    return this.prisma.product.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        originalPrice: true,
        category: true,
        isActive: true,
        isFeatured: true,
        rating: true,
        reviewCount: true,
        createdAt: true,
        updatedAt: true,
        images: {
          select: {
            id: true,
            imageUrl: true,
            altText: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: 'asc' },
          take: 1, // Only first image for listing
        },
        promotions: {
          select: {
            id: true,
            title: true,
            discountPercentage: true,
            isHeroPromotion: true,
          },
          where: { 
            isActive: true,
            startDate: { lte: new Date() },
            OR: [
              { endDate: null },
              { endDate: { gte: new Date() } }
            ]
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        promotions: {
          where: { 
            isActive: true,
            startDate: { lte: new Date() },
            OR: [
              { endDate: null },
              { endDate: { gte: new Date() } }
            ]
          }
        }
      }
    });

    if (!product) {
      throw new ProductNotFoundException();
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    // Verify product exists
    await this.findOne(id);

    // Check for name conflicts if name is being updated
    if (updateProductDto.name) {
      const existingProduct = await this.prisma.product.findFirst({
        where: { 
          name: updateProductDto.name,
          NOT: { id }
        }
      });

      if (existingProduct) {
        throw new ProductAlreadyExistsException();
      }
    }

    try {
      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: updateProductDto,
        include: {
          images: {
            orderBy: { sortOrder: 'asc' }
          },
          promotions: {
            where: { isActive: true }
          }
        }
      });

      return updatedProduct;
    } catch (error) {
      throw new ProductUpdateFailedException();
    }
  }

  async deactivate(id: string) {
    await this.findOne(id);

    try {
      const deactivatedProduct = await this.prisma.product.update({
        where: { id },
        data: { isActive: false },
        select: {
          id: true,
          name: true,
          isActive: true,
          updatedAt: true,
        }
      });

      return {
        message: 'Product deactivated successfully',
        product: deactivatedProduct
      };
    } catch (error) {
      throw new ProductUpdateFailedException();
    }
  }

  async activate(id: string) {
    await this.findOne(id);

    try {
      const activatedProduct = await this.prisma.product.update({
        where: { id },
        data: { isActive: true },
        select: {
          id: true,
          name: true,
          isActive: true,
          updatedAt: true,
        }
      });

      return {
        message: 'Product activated successfully',
        product: activatedProduct
      };
    } catch (error) {
      throw new ProductUpdateFailedException();
    }
  }

  // Utility method for featured products
  async findFeatured() {
    return this.prisma.product.findMany({
      where: { 
        isActive: true,
        isFeatured: true 
      },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1
        },
        promotions: {
          where: { 
            isActive: true,
            startDate: { lte: new Date() },
            OR: [
              { endDate: null },
              { endDate: { gte: new Date() } }
            ]
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
