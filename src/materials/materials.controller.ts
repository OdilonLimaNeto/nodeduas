import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MaterialQueryDto } from './dto/material-query.dto';
import { MaterialAdjustmentDto } from './dto/material-adjustment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('materials')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get('summary')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getSummary() {
    return this.materialsService.getSummary();
  }

  @Get('low-stock')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getLowStockMaterials(@Query('threshold') threshold?: string) {
    const thresholdNumber = threshold ? parseInt(threshold) : 10;
    return this.materialsService.getLowStockMaterials(thresholdNumber);
  }

  @Get('by-type')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getMaterialsByType() {
    return this.materialsService.getMaterialsByType();
  }

  @Get('by-supplier')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getMaterialsBySupplier() {
    return this.materialsService.getMaterialsBySupplier();
  }

  @Get(':id/financials')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getMaterialWithFinancials(@Param('id') id: string) {
    return this.materialsService.findOneWithFinancials(id);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async findOne(@Param('id') id: string) {
    return this.materialsService.findOne(id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MODERATOR)
  async findAll(@Query() query: MaterialQueryDto) {
    return this.materialsService.findAll(query);
  }

  @Post()
  @Roles(Role.ADMIN, Role.MODERATOR)
  async create(@Body() createMaterialDto: CreateMaterialDto) {
    return this.materialsService.create(createMaterialDto);
  }

  @Post(':id/adjust')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async adjustQuantity(
    @Param('id') id: string,
    @Body() adjustment: MaterialAdjustmentDto,
  ) {
    return this.materialsService.adjustQuantity(id, adjustment);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async update(
    @Param('id') id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ) {
    return this.materialsService.update(id, updateMaterialDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    await this.materialsService.remove(id);
    return { message: 'Material deleted successfully' };
  }
}
