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
  ],
  controllers: [HealthController],
})
export class AppModule {}
