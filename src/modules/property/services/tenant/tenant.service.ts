import { Inject, Injectable } from '@nestjs/common';
import { Tenant } from '../../models/apartment_tenant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { from, iif, map, Observable, of, switchMap } from 'rxjs';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { UserService } from 'src/modules/user/services/user.service';
import { ApartmentService } from '../apartment/apartment.service';
import { Apartment } from '../../models/apartment.entity';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    public readonly TenantRepository: Repository<Tenant>,

    @InjectRepository(Apartment)
    public readonly ApartmentRepository: Repository<Apartment>,
    @Inject() private userService: UserService,
    @Inject() private apartmentService: ApartmentService,
  ) {}

  public create(tenant: Tenant): Observable<Tenant> {
    const createdTenant = this.TenantRepository.create(tenant);
    return from(this.TenantRepository.save(createdTenant));
  }

  public assignTenantToAppartment(tenant: Tenant): Observable<Tenant> {
    //find user by mobile number
    //if user does not exist send sms to mobile number, inviting user to register
    //if user exists, assign tenant to user
    const userByMobileMumber = this.userService.findByMobileNumber(
      tenant.mobile_number,
    );

    return userByMobileMumber.pipe(
      switchMap((user) => {
        iif(() => user.id !== null, this.create(tenant), of(null)).pipe();
        if (user.hasId) {
          tenant.tenant_id = user.id;
          return this.create(tenant);
        } else {
          //send sms to mobile number, inviting user to register
          const apartment$ = this.ApartmentRepository.findOne({
            where: {
              id: tenant.apartment_id,
            },
            relations: ['subscription'],
          });
        }
      }),
    );
  }

  public update = (tenant: Tenant) =>
    from(this.TenantRepository.update(tenant.id, tenant));

  public findOne = (id: string) =>
    from(this.TenantRepository.findOneBy({ id }));

  public delete = (attachmentId: string) =>
    from(this.TenantRepository.delete(attachmentId));

  public findByApartmentId = (
    apartmentId: string,
    options: IPaginationOptions,
  ) =>
    from(
      paginate<Tenant>(this.TenantRepository, options, {
        apartment_id: apartmentId,
        relations: ['user'],
        select: {
          user: {
            id: true,
            username: true,
            fullname: true,
            email: true,
          },
        },
      }),
    );

  public updateStatus(id: string, status: string) {
    return from(this.TenantRepository.update(id, { status: status }));
  }
}
