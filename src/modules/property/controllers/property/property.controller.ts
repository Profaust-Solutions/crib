import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Logger,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PropertyService } from '../../services/property/property.service';
import {
  ApiResponse,
  ResponseCodes,
} from '@app/common/shared/models/api-response';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { UpdateResult } from 'typeorm';
import { Property } from '../../models/property.entity';
import { ApartmentService } from '../../services/apartment/apartment.service';
import { Apartment } from '../../models/apartment.entity';
import { TenantService } from '../../services/tenant/tenant.service';
import { Tenant } from '../../models/apartment_tenant.entity';

@Controller('properties')
export class PropertyController {
  private readonly logger = new Logger(PropertyController.name);
  constructor(
    public propertyService: PropertyService,
    public apartmentService: ApartmentService,
    public tenantService: TenantService,
  ) {}

  @Post('create')
  //@AuditLog('Create property')
  @Header('Cache-Control', 'none')
  create(@Body() property: Property): Observable<ApiResponse> {
    let response = new ApiResponse();
    const createdPropertyResult$ = this.propertyService.create(property);

    return createdPropertyResult$.pipe(
      map((createdProperty: Property) => {
        response.code = ResponseCodes.SUCCESS.code;
        response.message = ResponseCodes.SUCCESS.message;
        response.data = { ...createdProperty };
        return response;
      }),
    );
  }

  //@UseGuards(AuthTokenGuard)
  @Get('')
  //@AuditLog('Get Property')
  @Header('Cache-Control', 'none')
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();

    return this.propertyService.findAll({ page, limit }).pipe(
      map((propertyPagable) => {
        const propertyItems = propertyPagable.items;
        const propertyItemsMeta = propertyPagable.meta;
        if (propertyItems.length > 0) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;
          response.data = propertyItems;
          response.meta = propertyItemsMeta;
        } else {
          response.code = ResponseCodes.NO_RECORD_FOUND.code;
          response.message = ResponseCodes.NO_RECORD_FOUND.message;
        }
        return response;
      }),
    );
  }

  //@UseGuards(AuthTokenGuard)
  @Get(':propertyId')
  //@AuditLog('Get Property')
  @Header('Cache-Control', 'none')
  findOne(@Param('propertyId') propertyId: string): Observable<ApiResponse> {
    let response = new ApiResponse();

    return this.propertyService.findOne(propertyId).pipe(
      map((propertysPagable) => {
        if (propertysPagable) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;
          response.data = propertysPagable;
        } else {
          response.code = ResponseCodes.NO_RECORD_FOUND.code;
          response.message = ResponseCodes.NO_RECORD_FOUND.message;
        }
        return response;
      }),
    );
  }

  //@UseGuards(AuthTokenGuard)
  @Put(':propertyId')
  //@AuditLog('Update Department')
  @Header('Cache-Control', 'none')
  update(
    @Param('propertyId') propertyId: string,
    @Body() property: Property,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    property.id = propertyId;
    return this.propertyService.update(property).pipe(
      switchMap((property: UpdateResult) => {
        if (property.affected > 0) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;
          return this.propertyService.findOne(propertyId).pipe(
            map((property) => {
              if (property.hasId) {
                response.code = ResponseCodes.SUCCESS.code;
                response.message = ResponseCodes.SUCCESS.message;
                response.data = property;
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
  @Delete(':propertyId')
  //@AuditLog('Delete Property')
  @Header('Cache-Control', 'none')
  delete(@Param('propertyId') propertyId: string): Observable<ApiResponse> {
    let response = new ApiResponse();
    return this.propertyService.softDelete(propertyId).pipe(
      map((property) => {
        if (property.affected > 0) {
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

  @Post('apartment/create')
  //@AuditLog('Create apartment')
  @Header('Cache-Control', 'none')
  createApartment(@Body() apartment: Apartment): Observable<ApiResponse> {
    let response = new ApiResponse();
    const createdApartmentResult$ = this.apartmentService.create(apartment);

    return createdApartmentResult$.pipe(
      map((createdApartment: Apartment) => {
        response.code = ResponseCodes.SUCCESS.code;
        response.message = ResponseCodes.SUCCESS.message;
        response.data = { ...createdApartment };
        return response;
      }),
    );
  }

  //@UseGuards(AuthTokenGuard)
  @Put('apartment/:apartmentId')
  //@AuditLog('Update apartment')
  @Header('Cache-Control', 'none')
  updateApartment(
    @Param('apartmentId') apartmentId: string,
    @Body() apartment: Apartment,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    apartment.id = apartmentId;
    return this.apartmentService.update(apartment).pipe(
      switchMap((apartment: UpdateResult) => {
        if (apartment.affected > 0) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;
          return this.apartmentService.findOne(apartmentId).pipe(
            map((apartment) => {
              if (apartment) {
                response.code = ResponseCodes.SUCCESS.code;
                response.message = ResponseCodes.SUCCESS.message;
                response.data = apartment;
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
      catchError((error) => {
        console.log(error);
        response.code = ResponseCodes.FAILED.code;
        response.message = ResponseCodes.FAILED.message;
        return of(response);
      }),
    );
  }
  //@UseGuards(AuthTokenGuard)
  @Delete('apartment/:apartmentId')
  //@AuditLog('Delete apartment')
  @Header('Cache-Control', 'none')
  deleteApartment(
    @Param('apartmentId') apartmentId: string,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    return this.apartmentService.softDelete(apartmentId).pipe(
      map((apartment) => {
        if (apartment.affected > 0) {
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

  @HttpCode(200)
  @Get(':subscriptionId/apartments')
  //@AuditLog('Get property apartments')
  @Header('Cache-Control', 'none')
  findApartments(
    @Param('subscriptionId') subscriptionId: string,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();

    return this.apartmentService.findBysubscriptionId(subscriptionId).pipe(
      map((apartments) => {
        if (apartments.length > 0) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;
          response.data = apartments;
        } else {
          response.code = ResponseCodes.NO_RECORD_FOUND.code;
          response.message = ResponseCodes.NO_RECORD_FOUND.message;
        }
        return response;
      }),
    );
  }

  //@UseGuards(AuthTokenGuard)
  @Get('apartment/:apartmentId')
  //@AuditLog('Get Property')
  @Header('Cache-Control', 'none')
  findOneApartment(
    @Param('apartmentId') apartmentId: string,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    return this.apartmentService.findOne(apartmentId).pipe(
      map((apartmentPagable) => {
        if (apartmentPagable) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;
          response.data = apartmentPagable;
        } else {
          response.code = ResponseCodes.NO_RECORD_FOUND.code;
          response.message = ResponseCodes.NO_RECORD_FOUND.message;
        }
        return response;
      }),
    );
  }

  @HttpCode(200)
  //@UseGuards(AuthTokenGuard)
  @Get('apartment/:apartmentId/tenants')
  //@AuditLog('Get Property')
  @Header('Cache-Control', 'none')
  findTenants(
    @Param('apartmentId') apartmentId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    return this.tenantService
      .findByApartmentId(apartmentId, { page, limit })
      .pipe(
        map((tenantPagable) => {
          const tenantItems = tenantPagable.items;
          const tenantItemsMeta = tenantPagable.meta;
          if (tenantItems.length > 0) {
            response.code = ResponseCodes.SUCCESS.code;
            response.message = ResponseCodes.SUCCESS.message;
            response.data = tenantItems;
            response.meta = tenantItemsMeta;
          } else {
            response.code = ResponseCodes.NO_RECORD_FOUND.code;
            response.message = ResponseCodes.NO_RECORD_FOUND.message;
          }
          return response;
        }),
      );
  }

  @Post('apartment/assign-tenant')
  //@AuditLog('apartment assign-tenant')
  @Header('Cache-Control', 'none')
  assignTenant(@Body() tenant: Tenant): Observable<ApiResponse> {
    let response = new ApiResponse();
    const createdTenantResult$ = this.tenantService.create(tenant);

    return createdTenantResult$.pipe(
      map((createdTenant: Tenant) => {
        response.code = ResponseCodes.SUCCESS.code;
        response.message = ResponseCodes.SUCCESS.message;
        response.data = { ...createdTenant };
        return response;
      }),
    );
  }

  @Post('apartment/tenant/:tenantId')
  //@AuditLog('apartment assign-tenant')
  @Header('Cache-Control', 'none')
  updateTenant(
    @Param('tenantId') tenantId: string,
    @Body() tenant: Tenant,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    tenant.tenant_id = tenantId;

    return this.tenantService.update(tenant).pipe(
      switchMap((tenant: UpdateResult) => {
        if (tenant.affected > 0) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;
          return this.tenantService.findOne(tenantId).pipe(
            map((tenant) => {
              if (tenant) {
                response.code = ResponseCodes.SUCCESS.code;
                response.message = ResponseCodes.SUCCESS.message;
                response.data = tenant;
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
      catchError((error) => {
        console.log(error);
        response.code = ResponseCodes.FAILED.code;
        response.message = ResponseCodes.FAILED.message;
        return of(response);
      }),
    );
  }
  @HttpCode(200)
  @Post('tenant/invite-status')
  //@AuditLog('apartment assign-tenant')
  @Header('Cache-Control', 'none')
  updateTenantInvite(@Body() invite: Tenant): Observable<ApiResponse> {
    let response = new ApiResponse();

    return this.tenantService.updateStatus(invite.id, invite.status).pipe(
      map(() => {
        response.code = ResponseCodes.SUCCESS.code;
        response.message = ResponseCodes.SUCCESS.message;
        return response;
      }),
      catchError((error) => {
        console.error(error);
        response.code = ResponseCodes.FAILED.code;
        response.message = ResponseCodes.FAILED.message;
        throw new BadRequestException(response);
        //return of(response);
      }),
    );
  }
  @HttpCode(200)
  //@UseGuards(AuthTokenGuard)
  @Delete('apartment/tenant/:tenantId')
  //@AuditLog('Delete tenant')
  @Header('Cache-Control', 'none')
  deleteTenant(@Param('tenantId') tenantId: string): Observable<ApiResponse> {
    let response = new ApiResponse();
    return this.tenantService.delete(tenantId).pipe(
      map((tenant) => {
        if (tenant.affected > 0) {
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
