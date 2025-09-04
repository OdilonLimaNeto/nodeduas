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
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PromotionQueryDto } from './dto/promotion-query.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('admin/promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get('active')
  @Public()
  async getActivePromotions() {
    return this.promotionsService.getActivePromotions();
  }

  @Get('hero')
  @Public()
  async getHeroPromotions() {
    return this.promotionsService.getHeroPromotions();
  }

  @Get('summary')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getPromotionsSummary() {
    return this.promotionsService.getPromotionsSummary();
  }

  @Get('product/:productId')
  @Public()
  async getPromotionsByProduct(@Param('productId') productId: string) {
    return this.promotionsService.findByProduct(productId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.MODERATOR)
  async create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionsService.create(createPromotionDto);
  }

  @Get()
  @Public()
  async findAll(@Query() query: PromotionQueryDto) {
    return this.promotionsService.findAll(query);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async update(@Param('id') id: string, @Body() updatePromotionDto: UpdatePromotionDto) {
    return this.promotionsService.update(id, updatePromotionDto);
  }

  @Patch(':id/activate')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async activate(@Param('id') id: string) {
    return this.promotionsService.activate(id);
  }

  @Patch(':id/deactivate')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async deactivate(@Param('id') id: string) {
    return this.promotionsService.deactivate(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.promotionsService.remove(id);
  }
}
