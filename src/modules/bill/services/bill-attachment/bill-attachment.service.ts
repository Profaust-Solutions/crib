import { Injectable } from '@nestjs/common';
import { AwesomeBillAttachment } from '../../models/bill-attachment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, from } from 'rxjs';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class BillAttachmentService {
  constructor(
    @InjectRepository(AwesomeBillAttachment)
    public readonly AwesomeBillAttachmentRepository: Repository<AwesomeBillAttachment>,
  ) {}

  public create(
    awesomeBillAttachment: AwesomeBillAttachment,
  ): Observable<AwesomeBillAttachment> {
    const createdAwesomeBillAttachment =
      this.AwesomeBillAttachmentRepository.create(awesomeBillAttachment);
    return from(
      this.AwesomeBillAttachmentRepository.save(awesomeBillAttachment),
    );
  }

  public update = (awesomeBillAttachment: AwesomeBillAttachment) =>
    from(
      this.AwesomeBillAttachmentRepository.update(
        awesomeBillAttachment.id,
        awesomeBillAttachment,
      ),
    );
  public findAll = (options: IPaginationOptions) =>
    from(
      paginate<AwesomeBillAttachment>(
        this.AwesomeBillAttachmentRepository,
        options,
        {},
      ),
    );

  public findByBillId = (billId: string) =>
    from(this.AwesomeBillAttachmentRepository.findBy({ bill_id: billId }));

  public findOne = (id: string) =>
    from(this.AwesomeBillAttachmentRepository.findOneBy({ id }));

  public delete = (attachmentId: string) =>
    from(this.AwesomeBillAttachmentRepository.delete(attachmentId));

  //public softDelete = (billId: string) => from(this.AwesomeBillRepository.softDelete(billId));

  public softDelete(attachmentId: string) {
    this.AwesomeBillAttachmentRepository.update(attachmentId, {
      soft_delete: true,
    });
    return from(this.AwesomeBillAttachmentRepository.softDelete(attachmentId));
  }
}
