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

@Controller('awesomebills')
export class BillController {
  private readonly logger = new Logger(BillController.name);
  constructor(public billService: BillService,public billAssignmentService:BillAssignmentService) {}

  @Post('create')
  //@AuditLog('Create Department')
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
}
