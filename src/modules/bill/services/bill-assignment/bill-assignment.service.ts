import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AwesomeBillAssignment } from '../../models/bill-assignment.entity';
import { Observable, from } from 'rxjs';

@Injectable()
export class BillAssignmentService {
    constructor(
        @InjectRepository(AwesomeBillAssignment)
        public readonly AwesomeBillAssignmentRepository: Repository<AwesomeBillAssignment>,
      ) {}

      public assign(
        awesomeBillAssignment: AwesomeBillAssignment,
      ): Observable<AwesomeBillAssignment> {
        const createdAwesomeBillAssignment =
          this.AwesomeBillAssignmentRepository.create(awesomeBillAssignment);
        return from(
          this.AwesomeBillAssignmentRepository.save(awesomeBillAssignment),
        );
      }
      public unAssign = (awesomeBillAssignment: AwesomeBillAssignment) =>
        from(
          this.AwesomeBillAssignmentRepository.delete({
            bill_id: awesomeBillAssignment.bill_id,
            assigned_to: awesomeBillAssignment.assigned_to,
          }),
        );
}
