import { Module } from '@nestjs/common';
import { PropertyController } from './controllers/property/property.controller';
import { PropertyService } from './services/property/property.service';
import { Property } from './models/property.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Apartment } from './models/apartment.entity';
import { ApartmentService } from './services/apartment/apartment.service';
import { TenantService } from './services/tenant/tenant.service';
import { Tenant } from './models/apartment_tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Property,Apartment,Tenant])],
  controllers: [PropertyController],
  providers: [PropertyService, ApartmentService, TenantService]
})
export class PropertyModule {}
