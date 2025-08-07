import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { AwsS3Service } from "../common/providers/s3/s3.service";
import { randomUUID } from "crypto";
import {
  ProductNotFoundException,
  ProductImageNotFoundException,
  MaxImagesExceededException,
  InvalidFileTypeException,
  ProductImageUploadFailedException,
} from "../common/exceptions";
import { FileUploadDto } from "./dto/upload-urls.dto";
import { UploadConfirmationDto } from "./dto/confirm-upload.dto";
import { ImageOrderDto } from "./dto/reorder-images.dto";

@Injectable()
export class ProductImagesService {
  private readonly maxImagesPerProduct: number;
  private readonly allowedFileTypes: string[];

  constructor(
    private prisma: PrismaService,
    private awsS3Service: AwsS3Service,
    private configService: ConfigService
  ) {
    // Get configuration from environment variables with defaults
    this.maxImagesPerProduct = this.configService.get<number>(
      "MAX_IMAGES_PER_PRODUCT",
      3
    );

    const allowedTypesString = this.configService.get<string>(
      "ALLOWED_FILE_TYPES",
      "jpg,jpeg,png,webp"
    );
    this.allowedFileTypes = allowedTypesString
      .split(",")
      .map((type) => type.trim().toLowerCase());
  }

  async generateUploadUrls(productId: string, files: FileUploadDto[]) {
    // Verificar se produto existe e está ativo
    const product = await this.prisma.product.findUnique({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      throw new ProductNotFoundException();
    }

    // Verificar limite de imagens
    const currentImagesCount = await this.prisma.productImage.count({
      where: { productId },
    });

    if (currentImagesCount + files.length > this.maxImagesPerProduct) {
      throw new MaxImagesExceededException(
        currentImagesCount,
        this.maxImagesPerProduct
      );
    }

    // Gerar URLs de upload
    const uploadPromises = files.map(async (file, index) => {
      const fileExtension = file.fileName.split(".").pop()?.toLowerCase();

      // Validar tipo de arquivo usando configuração dinâmica
      if (!this.allowedFileTypes.includes(fileExtension || "")) {
        throw new InvalidFileTypeException();
      }

      // Usar variável de ambiente para o módulo
      const modulePath = this.awsS3Service.getProductsModulePath();
      const key = this.awsS3Service.generateUploadKey(
        modulePath,
        productId,
        file.fileName
      );
      const uploadUrl = await this.awsS3Service.generateUploadUrl(
        key,
        file.contentType
      );

      return {
        key,
        uploadUrl,
        fileName: file.fileName,
        sortOrder: currentImagesCount + index + 1,
      };
    });

    return Promise.all(uploadPromises);
  }

  async confirmUpload(productId: string, uploads: UploadConfirmationDto[]) {
    // Verificar se produto existe
    const product = await this.prisma.product.findUnique({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      throw new ProductNotFoundException();
    }

    try {
      const images = uploads.map((upload, index) => ({
        id: randomUUID(),
        productId,
        imageUrl: this.awsS3Service.getPublicUrl(upload.key),
        altText: upload.altText || `${product.name} - Image ${index + 1}`,
        sortOrder: index + 1,
      }));

      await this.prisma.productImage.createMany({
        data: images,
      });

      return this.findByProductId(productId);
    } catch (error) {
      throw new ProductImageUploadFailedException();
    }
  }

  async findByProductId(productId: string) {
    return this.prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: "asc" },
    });
  }

  async updateSortOrder(productId: string, imageOrders: ImageOrderDto[]) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      throw new ProductNotFoundException();
    }

    try {
      // Atualizar ordem das imagens em transação
      await this.prisma.$transaction(
        imageOrders.map(({ id, sortOrder }) =>
          this.prisma.productImage.update({
            where: { id, productId }, // Garantir que a imagem pertence ao produto
            data: { sortOrder },
          })
        )
      );

      return this.findByProductId(productId);
    } catch (error) {
      throw new ProductImageUploadFailedException();
    }
  }

  async delete(productId: string, imageId: string) {
    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new ProductImageNotFoundException();
    }

    try {
      // Deletar do S3
      const key = this.awsS3Service.extractKeyFromUrl(image.imageUrl);
      await this.awsS3Service.deleteFile(key);

      // Deletar do banco
      await this.prisma.productImage.delete({
        where: { id: imageId },
      });

      // Reordenar imagens restantes
      const remainingImages = await this.prisma.productImage.findMany({
        where: { productId },
        orderBy: { sortOrder: "asc" },
      });

      if (remainingImages.length > 0) {
        await this.prisma.$transaction(
          remainingImages.map((img, index) =>
            this.prisma.productImage.update({
              where: { id: img.id },
              data: { sortOrder: index + 1 },
            })
          )
        );
      }

      return {
        message: "Image deleted successfully",
        remainingCount: remainingImages.length,
        maxAllowed: this.maxImagesPerProduct,
      };
    } catch (error) {
      throw new ProductImageUploadFailedException();
    }
  }

  getUploadConfiguration() {
    return this.awsS3Service.getUploadConfiguration();
  }
}
