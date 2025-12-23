import { Injectable } from '@nestjs/common';
import { from, Observable, switchMap } from 'rxjs';
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

  public create(apartment: Apartment): Observable<Apartment> {
    const createdApartment = this.ApartmentRepository.create(apartment);
    return from(this.ApartmentRepository.save(createdApartment));
  }

  public update = (apartment: Apartment) =>
    from(this.ApartmentRepository.update(apartment.id, apartment));

  public updatew = (apartment: Apartment) => {
    const foundApartmentResult = this.findOne(apartment.id);
    return foundApartmentResult.pipe(
      switchMap((foundApartment: Apartment) => {
        if (!foundApartment) {
          throw new Error('Apartment not found');
        }
        foundApartment.description = apartment.description;
        foundApartment.number_of_rooms = apartment.number_of_rooms;
        foundApartment.location = apartment.location;
        foundApartment.type = apartment.type;
        foundApartment.images = apartment.images;
        foundApartment.appartment_rules = apartment.appartment_rules;
        return from(
          this.ApartmentRepository.update(apartment.id, foundApartment),
        );
      }),
    );
  };
  public findAll = (options: IPaginationOptions) =>
    from(paginate<Apartment>(this.ApartmentRepository, options, {}));

  // public findByPropertyId = (propertyId: string) =>
  //   from(this.ApartmentRepository.findBy({ property_id: propertyId }));

   public findBySubscriptionId = (subscriptionId: string) =>
    from(this.ApartmentRepository.findBy({ subscription_id: subscriptionId }));

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
