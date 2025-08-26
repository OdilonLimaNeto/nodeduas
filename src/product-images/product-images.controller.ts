import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { ProductImagesService } from "./product-images.service";
import { Roles } from "../common/decorators/roles.decorator";
import { Public } from "../common/decorators/public.decorator";
import { GenerateUploadUrlsDto } from "./dto/upload-urls.dto";
import { ConfirmUploadDto } from "./dto/confirm-upload.dto";
import { ReorderImagesDto } from "./dto/reorder-images.dto";
import { Role } from "@/common/enums/role.enum";

@Controller("products/:productId/images")
export class ProductImagesController {
  constructor(private productImagesService: ProductImagesService) {}

  @Public()
  @Get("config")
  async getUploadConfig() {
    return this.productImagesService.getUploadConfiguration();
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Post("upload-urls")
  async generateUploadUrls(
    @Param("productId") productId: string,
    @Body() generateUploadUrlsDto: GenerateUploadUrlsDto
  ) {
    return this.productImagesService.generateUploadUrls(
      productId,
      generateUploadUrlsDto.files
    );
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Post("confirm")
  async confirmUpload(
    @Param("productId") productId: string,
    @Body() confirmUploadDto: ConfirmUploadDto
  ) {
    return this.productImagesService.confirmUpload(
      productId,
      confirmUploadDto.uploads
    );
  }

  @Public()
  @Get()
  async getImages(@Param("productId") productId: string) {
    return this.productImagesService.findByProductId(productId);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Patch("reorder")
  async updateSortOrder(
    @Param("productId") productId: string,
    @Body() reorderImagesDto: ReorderImagesDto
  ) {
    return this.productImagesService.updateSortOrder(
      productId,
      reorderImagesDto.imageOrders
    );
  }

  @Roles(Role.ADMIN)
  @Delete(":imageId")
  async deleteImage(
    @Param("productId") productId: string,
    @Param("imageId") imageId: string
  ) {
    return this.productImagesService.delete(productId, imageId);
  }
}
