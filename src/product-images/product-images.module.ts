import { Module } from "@nestjs/common";
import { ProductImagesService } from "./product-images.service";
import { ProductImagesController } from "./product-images.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AwsS3Service } from "../common/providers/s3/s3.service";

@Module({
  imports: [PrismaModule],
  controllers: [ProductImagesController],
  providers: [ProductImagesService, AwsS3Service],
  exports: [ProductImagesService],
})
export class ProductImagesModule {}
