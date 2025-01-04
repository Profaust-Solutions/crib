import { Injectable } from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { Apartment } from '../../models/apartment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class ApartmentService {

    constructor(
        @InjectRepository(Apartment)
        public readonly ApartmentRepository: Repository<Apartment>,
      ) {}
    
      public create(
        apartment: Apartment,
      ): Observable<Apartment> {
        const createdApartment =
          this.ApartmentRepository.create(apartment);
        return from(
          this.ApartmentRepository.save(apartment),
        );
      }
    
      public update = (apartment: Apartment) =>
        from(
          this.ApartmentRepository.update(
            apartment.id,
            apartment,
          ),
        );
      public findAll = (options: IPaginationOptions) =>
        from(
          paginate<Apartment>(
            this.ApartmentRepository,
            options,
            {},
          ),
        );
    
      public findByPropertyId = (propertyId: string) =>
        from(this.ApartmentRepository.findBy({ property_id: propertyId }));

      public findByTenantId = (tenantId: string) =>
        from(this.ApartmentRepository.findBy({ tenant: tenantId }));
    
      public findOne = (id: string) =>
        from(this.ApartmentRepository.findOneBy({ id }));
    
      public delete = (attachmentId: string) =>
        from(this.ApartmentRepository.delete(attachmentId));
    
      //public softDelete = (billId: string) => from(this.AwesomeBillRepository.softDelete(billId));
    
      public softDelete(attachmentId: string) {
        this.ApartmentRepository.update(attachmentId, {
          soft_delete: true,
        });
        return from(this.ApartmentRepository.softDelete(attachmentId));
      }
}
