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
import { FinancialRecordsService } from './financial-records.service';
import { CreateFinancialRecordDto } from './dto/create-financial-record.dto';
import { UpdateFinancialRecordDto } from './dto/update-financial-record.dto';
import { FinancialRecordQueryDto } from './dto/financial-record-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('financial-records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinancialRecordsController {
  constructor(private readonly financialRecordsService: FinancialRecordsService) {}

  @Get('summary')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getSummary(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.financialRecordsService.getSummary(dateFrom, dateTo);
  }

  @Get('revenue')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getRevenue(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.financialRecordsService.getRevenue(dateFrom, dateTo);
  }

  @Get('expenses')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getExpenses(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.financialRecordsService.getExpenses(dateFrom, dateTo);
  }

  @Get(':id/relations')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getFinancialRecordWithRelations(@Param('id') id: string) {
    return this.financialRecordsService.findOneWithRelations(id);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async findOne(@Param('id') id: string) {
    return this.financialRecordsService.findOne(id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MODERATOR)
  async findAll(@Query() query: FinancialRecordQueryDto) {
    return this.financialRecordsService.findAll(query);
  }

  @Post()
  @Roles(Role.ADMIN, Role.MODERATOR)
  async create(@Body() createFinancialRecordDto: CreateFinancialRecordDto) {
    return this.financialRecordsService.create(createFinancialRecordDto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async update(
    @Param('id') id: string,
    @Body() updateFinancialRecordDto: UpdateFinancialRecordDto,
  ) {
    return this.financialRecordsService.update(id, updateFinancialRecordDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    await this.financialRecordsService.remove(id);
    return { message: 'Financial record deleted successfully' };
  }
}
