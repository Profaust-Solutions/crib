import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Logger,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BillService } from '../../services/bill/bill.service';
import { AwesomeBill } from '../../models/bill.entity';
import {
  ApiResponse,
  ResponseCodes,
} from '@app/common/shared/models/api-response';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { UpdateResult } from 'typeorm';
import { AwesomeBillAssignment } from '../../models/bill-assignment.entity';
import { BillAssignmentService } from '../../services/bill-assignment/bill-assignment.service';
import { BillAttachmentService } from '../../services/bill-attachment/bill-attachment.service';
import { AwesomeBillAttachment } from '../../models/bill-attachment.entity';

@Controller('awesomebills')
export class BillController {
  private readonly logger = new Logger(BillController.name);
  constructor(
    public billService: BillService,
    public billAssignmentService: BillAssignmentService,
    public billAttachmentService: BillAttachmentService,
  ) {}

  @Post('create')
  //@AuditLog('Create awesomeBill')
  @Header('Cache-Control', 'none')
  create(@Body() awesomeBill: AwesomeBill[]): Observable<ApiResponse> {
    let response = new ApiResponse();
    let bulkRequest = awesomeBill.map((bill: AwesomeBill) => {
      return this.billService.create(bill);
    });
    const createdBillResult$ = forkJoin(bulkRequest);

    return createdBillResult$.pipe(
      map((createdBill: AwesomeBill[]) => {
        response.code = ResponseCodes.SUCCESS.code;
        response.message = ResponseCodes.SUCCESS.message;
        response.data = [...createdBill];
        return response;
      }),
    );
  }

  //@UseGuards(AuthTokenGuard)
  @Get('')
  //@AuditLog('Get AwesomeBill')
  @Header('Cache-Control', 'none')
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();

    return this.billService.findAll({ page, limit }).pipe(
      map((billsPagable) => {
        const awesomeBillItems = billsPagable.items;
        const awesomeBillItemsMeta = billsPagable.meta;
        if (awesomeBillItems.length > 0) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;
          response.data = awesomeBillItems;
          response.meta = awesomeBillItemsMeta;
        } else {
          response.code = ResponseCodes.NO_RECORD_FOUND.code;
          response.message = ResponseCodes.NO_RECORD_FOUND.message;
        }
        return response;
      }),
    );
  }

  //@UseGuards(AuthTokenGuard)
  @Get(':billId')
  //@AuditLog('Get AwesomeBill')
  @Header('Cache-Control', 'none')
  findOne(@Param('billId') billId: string): Observable<ApiResponse> {
    let response = new ApiResponse();

    return this.billService.findOne(billId).pipe(
      map((billsPagable) => {
        if (billsPagable) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;
          response.data = billsPagable;
        } else {
          response.code = ResponseCodes.NO_RECORD_FOUND.code;
          response.message = ResponseCodes.NO_RECORD_FOUND.message;
        }
        return response;
      }),
    );
  }

  //@UseGuards(AuthTokenGuard)
  @Put(':billId')
  //@AuditLog('Update Department')
  @Header('Cache-Control', 'none')
  update(
    @Param('billId') billId: string,
    @Body() awesomeBill: AwesomeBill,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    awesomeBill.id = billId;
    return this.billService.update(awesomeBill).pipe(
      switchMap((awesomeBill: UpdateResult) => {
        if (awesomeBill.affected > 0) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;
          return this.billService.findOne(billId).pipe(
            map((awesomeBill) => {
              if (awesomeBill.hasId) {
                response.code = ResponseCodes.SUCCESS.code;
                response.message = ResponseCodes.SUCCESS.message;
                response.data = awesomeBill;
              } else {
                response.code = ResponseCodes.NO_RECORD_FOUND.code;
                response.message = ResponseCodes.NO_RECORD_FOUND.message;
              }
              return response;
            }),
          );
        } else {
          response.code = ResponseCodes.FAILED.code;
          response.message = ResponseCodes.FAILED.message;
        }
      }),
    );
  }

  //@UseGuards(AuthTokenGuard)
  @Delete(':billId')
  //@AuditLog('Delete AwesomeBill')
  @Header('Cache-Control', 'none')
  delete(@Param('billId') billId: string): Observable<ApiResponse> {
    let response = new ApiResponse();
    return this.billService.softDelete(billId).pipe(
      map((bill) => {
        if (bill.affected > 0) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;
        } else {
          response.code = ResponseCodes.NO_RECORD_FOUND.code;
          response.message = ResponseCodes.NO_RECORD_FOUND.message;
        }
        return response;
      }),
    );
  }

  @Post('assign')
  //@AuditLog('assign awesomeBill')
  @Header('Cache-Control', 'none')
  assign(
    @Body() awesomeBillAssignment: AwesomeBillAssignment[],
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    let bulkRequest = awesomeBillAssignment.map((bill: AwesomeBill) => {
      return this.billAssignmentService.assign(bill);
    });
    const createdBillAssignmentResult$ = forkJoin(bulkRequest);

    return createdBillAssignmentResult$.pipe(
      map((createdAwesomeBillAssignment: AwesomeBillAssignment[]) => {
        response.code = ResponseCodes.SUCCESS.code;
        response.message = ResponseCodes.SUCCESS.message;
        response.data = [...createdAwesomeBillAssignment];
        return response;
      }),
    );
  }

  @Post('unassign')
  //@AuditLog('assign awesomeBill')
  @Header('Cache-Control', 'none')
  unAssign(
    @Body() awesomeBillAssignment: AwesomeBillAssignment,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    return this.billAssignmentService.unAssign(awesomeBillAssignment).pipe(
      map((bill) => {
        if (bill.affected > 0) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;
        } else {
          response.code = ResponseCodes.NO_RECORD_FOUND.code;
          response.message = ResponseCodes.NO_RECORD_FOUND.message;
        }
        return response;
      }),
    );
  }

  @Post('attachment/create')
  //@AuditLog('Create attachment')
  @Header('Cache-Control', 'none')
  createAttachment(
    @Body() awesomeBillAttachment: AwesomeBillAttachment[],
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    let bulkRequest = awesomeBillAttachment.map((bill: AwesomeBill) => {
      return this.billAttachmentService.create(bill);
    });
    const createdBillAttachmentResult$ = forkJoin(bulkRequest);

    return createdBillAttachmentResult$.pipe(
      map((createdBillAttachment: AwesomeBillAttachment[]) => {
        response.code = ResponseCodes.SUCCESS.code;
        response.message = ResponseCodes.SUCCESS.message;
        response.data = [...createdBillAttachment];
        return response;
      }),
    );
  }

  //@UseGuards(AuthTokenGuard)
  @Put('attachment/:attachmentId')
  //@AuditLog('Update attachment')
  @Header('Cache-Control', 'none')
  updateAttachment(
    @Param('attachmentId') attachmentId: string,
    @Body() awesomeBillAttachment: AwesomeBillAttachment,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    awesomeBillAttachment.id = attachmentId;
    return this.billAttachmentService.update(awesomeBillAttachment).pipe(
      switchMap((awesomeBillAttachment: UpdateResult) => {
        if (awesomeBillAttachment.affected > 0) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;
          return this.billAttachmentService.findOne(attachmentId).pipe(
            map((awesomeBillAttachment) => {

              if (awesomeBillAttachment) {
                response.code = ResponseCodes.SUCCESS.code;
                response.message = ResponseCodes.SUCCESS.message;
                response.data = awesomeBillAttachment;
              } else {
                response.code = ResponseCodes.NO_RECORD_FOUND.code;
                response.message = ResponseCodes.NO_RECORD_FOUND.message;
              }
              return response;
            }),
          );
        } else {
          response.code = ResponseCodes.FAILED.code;
          response.message = ResponseCodes.FAILED.message;
        }
      }),
    );
  }

  //@UseGuards(AuthTokenGuard)
  @Delete('attachment/:attachmentId')
  //@AuditLog('Delete AwesomeBill')
  @Header('Cache-Control', 'none')
  deleteAttachment(
    @Param('attachmentId') attachmentId: string,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    return this.billAttachmentService.softDelete(attachmentId).pipe(
      map((attachment) => {
        if (attachment.affected > 0) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;
        } else {
          response.code = ResponseCodes.NO_RECORD_FOUND.code;
          response.message = ResponseCodes.NO_RECORD_FOUND.message;
        }
        return response;
      }),
    );
  }

  @Get(':billId/attachments')
  //@AuditLog('Get AwesomeBill attachments')
  @Header('Cache-Control', 'none')
  findAttachments(@Param('billId') billId: string): Observable<ApiResponse> {
    let response = new ApiResponse();

    return this.billAttachmentService.findByBillId(billId).pipe(
      map((billAttachments) => {
        if (billAttachments.length > 0) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;
          response.data = billAttachments;
        } else {
          response.code = ResponseCodes.NO_RECORD_FOUND.code;
          response.message = ResponseCodes.NO_RECORD_FOUND.message;
        }
        return response;
      }),
    );
  }
}
