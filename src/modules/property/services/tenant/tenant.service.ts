import { Inject, Injectable } from '@nestjs/common';
import { Tenant } from '../../models/apartment_tenant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { from, iif, map, Observable } from 'rxjs';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { UserService } from 'src/modules/user/services/user.service';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    public readonly TenantRepository: Repository<Tenant>,
    @Inject() private userService: UserService,
  ) {}

  public create(tenant: Tenant): Observable<Tenant> {
    const createdTenant = this.TenantRepository.create(tenant);
    return from(this.TenantRepository.save(createdTenant));
  }

  public assignTenantToAppartment(tenant: Tenant) {
    //find user by mobile number
    //if user does not exist send sms to mobile number, inviting user to register
    //if user exists, assign tenant to user
    const userByMobileMumber = this.userService.findByMobileNumber(
      tenant.mobile_number,
    );

    userByMobileMumber.pipe(
      map((user) => {
        if (user.hasId) {
          tenant.tenant_id = user.id;
        } else {
          //send sms to mobile number, inviting user to register
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
