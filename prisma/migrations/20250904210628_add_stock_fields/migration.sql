-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'DISCONTINUED');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "last_stock_update" TIMESTAMP(3),
ADD COLUMN     "max_stock_level" INTEGER,
ADD COLUMN     "min_stock_level" INTEGER,
ADD COLUMN     "stock_quantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stock_status" "StockStatus" NOT NULL DEFAULT 'IN_STOCK';
