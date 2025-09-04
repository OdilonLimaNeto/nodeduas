import { Module } from '@nestjs/common';
import { FinancialRecordsService } from './financial-records.service';
import { FinancialRecordsController } from './financial-records.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FinancialRecordsController],
  providers: [FinancialRecordsService],
  exports: [FinancialRecordsService],
})
export class FinancialRecordsModule {}
