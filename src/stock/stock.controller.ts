import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { UpdateStockDto } from './dto/update-stock.dto';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';
import { StockQueryDto } from './dto/stock-query.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@/common/enums/role.enum';

@Controller('admin/stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('low')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getLowStockProducts() {
    return this.stockService.getLowStockProducts();
  }

  @Get('out-of-stock')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getOutOfStockProducts() {
    return this.stockService.getOutOfStockProducts();
  }

  @Get('summary')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getStockSummary() {
    return this.stockService.getStockSummary();
  }

  @Get('status')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getProductsByStockStatus(@Query() query: StockQueryDto) {
    return this.stockService.getProductsByStockStatus(query);
  }

  @Get(':productId')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getProductStock(@Param('productId') productId: string) {
    return this.stockService.getProductStock(productId);
  }

  @Patch(':productId')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async updateStock(
    @Param('productId') productId: string,
    @Body() updateStockDto: UpdateStockDto,
  ) {
    return this.stockService.updateStock(productId, updateStockDto);
  }

  @Post(':productId/adjust')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async adjustStock(
    @Param('productId') productId: string,
    @Body() adjustment: StockAdjustmentDto,
  ) {
    return this.stockService.adjustStock(productId, adjustment);
  }
}
