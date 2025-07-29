import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwesomeBill } from './models/bill.entity';
import { BillService } from './services/bill/bill.service';
import { BillController } from './controllers/bill/bill.controller';
import { BillAssignmentService } from './services/bill-assignment/bill-assignment.service';
import { AwesomeBillAssignment } from './models/bill-assignment.entity';
import { AwesomeBillAttachment } from './models/bill-attachment.entity';
import { BillAttachmentService } from './services/bill-attachment/bill-attachment.service';
import { SharedModule } from '@app/common';

@Module({
  imports: [TypeOrmModule.forFeature([AwesomeBill,AwesomeBillAssignment,AwesomeBillAttachment]),SharedModule],
  providers: [BillService, BillAssignmentService, BillAttachmentService],
  controllers: [BillController],
})
export class BillModule {}
