import { Injectable } from '@nestjs/common';
import { Property } from '../../models/property.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { Observable, from } from 'rxjs';
import { Repository } from 'typeorm';

@Injectable()
export class PropertyService {
    constructor(
        @InjectRepository(Property)
        public readonly PropertyRepository: Repository<Property>,
      ) {}
    
      public create(property: Property): Observable<Property> {
        const createdProperty = this.PropertyRepository.create(property);
        return from(this.PropertyRepository.save(createdProperty));
      }
      public update = (property: Property) =>
        from(this.PropertyRepository.update(property.id, property));

      public findAll = (options: IPaginationOptions) =>
        from(paginate<Property>(this.PropertyRepository, options, {}));
    
      public findOne = (id: string) =>
        from(this.PropertyRepository.findOneBy({ id }));
    
      public delete = (propertyId: string) =>
        from(this.PropertyRepository.delete(propertyId));
    
      //public softDelete = (propertyId: string) => from(this.PropertyRepository.softDelete(propertyId));
    
      public softDelete(propertyId: string) {
        this.PropertyRepository.update(propertyId, { soft_delete: true });
        return from(this.PropertyRepository.softDelete(propertyId));
      }
}
