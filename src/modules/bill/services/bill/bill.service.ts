import { Injectable } from '@nestjs/common';
import { AwesomeBill } from '../../models/bill.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { from, Observable } from 'rxjs';
import { AwesomeBillAssignment } from '../../models/bill-assignment.entity';

@Injectable()
export class BillService {
  constructor(
    @InjectRepository(AwesomeBill)
    public readonly AwesomeBillRepository: Repository<AwesomeBill>,
  ) {}

  public create(AwesomeBill: AwesomeBill): Observable<AwesomeBill> {
    const createdAwesomeBill = this.AwesomeBillRepository.create(AwesomeBill);
    return from(this.AwesomeBillRepository.save(createdAwesomeBill));
  }
  public update = (AwesomeBill: AwesomeBill) =>
    from(this.AwesomeBillRepository.update(AwesomeBill.id, AwesomeBill));
  public findAll = (options: IPaginationOptions) =>
    from(paginate<AwesomeBill>(this.AwesomeBillRepository, options, {}));

  public findOne = (id: string) =>
    from(this.AwesomeBillRepository.findOneBy({ id }));

  public delete = (billId: string) =>
    from(this.AwesomeBillRepository.delete(billId));

  //public softDelete = (billId: string) => from(this.AwesomeBillRepository.softDelete(billId));

  public softDelete(billId: string) {
    this.AwesomeBillRepository.update(billId, { soft_delete: true });
    return from(this.AwesomeBillRepository.softDelete(billId));
  }

  public findByTenantId = (userId: string, options: IPaginationOptions) =>
    from(
      paginate<AwesomeBill>(this.AwesomeBillRepository, options, {
        user_id: userId,
      }),
    );
}
