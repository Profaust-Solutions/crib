import { Injectable } from '@nestjs/common';
import { Tenant } from '../../models/apartment_tenant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { from, Observable } from 'rxjs';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    public readonly TenantRepository: Repository<Tenant>,
  ) {}

  public create(tenant: Tenant): Observable<Tenant> {
    const createdTenant = this.TenantRepository.create(tenant);
    return from(this.TenantRepository.save(createdTenant));
  }

  public update = (tenant: Tenant) =>
    from(this.TenantRepository.update(tenant.id, tenant));

  public findOne = (id: string) =>
    from(this.TenantRepository.findOneBy({ id }));

  public delete = (attachmentId: string) =>
    from(this.TenantRepository.delete(attachmentId));

  public findByApartmentId = (apartmentId: string, options: IPaginationOptions) =>
    from(paginate<Tenant>(this.TenantRepository, options, {
        apartment_id: apartmentId,
        relations: ['user'],
        select:{
            user:{
                id: true,
                username: true,
                fullname: true,
                email: true,
            }
        }
    }));
}
