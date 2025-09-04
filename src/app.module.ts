import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ProductsModule } from "./products/products.module";
import { ProductImagesModule } from "./product-images/product-images.module";
import { HealthController } from "./health/health.controller";
import { environmentSchema } from "./config/environment.schema";
import { getEnvFilePath } from "./config/environment.loader";
import { StockModule } from "./stock/stock.module";
import { PromotionsModule } from "./promotions/promotions.module";
import { MaterialsModule } from "./materials/materials.module";
import { FinancialRecordsModule } from "./financial-records/financial-records.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePath(),
      validationSchema: environmentSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    ProductImagesModule,
    StockModule,
    PromotionsModule,
    MaterialsModule,
    FinancialRecordsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
