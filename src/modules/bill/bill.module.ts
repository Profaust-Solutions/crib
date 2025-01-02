import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwesomeBill } from './models/bill.entity';
import { BillService } from './services/bill/bill.service';
import { BillController } from './controllers/bill/bill.controller';
import { BillAssignmentService } from './services/bill-assignment/bill-assignment.service';
import { AwesomeBillAssignment } from './models/bill-assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AwesomeBill,AwesomeBillAssignment])],
  providers: [BillService, BillAssignmentService],
  controllers: [BillController],
})
export class BillModule {}
