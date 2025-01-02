import { Test, TestingModule } from '@nestjs/testing';
import { BillAssignmentService } from './bill-assignment.service';

describe('BillAssignmentService', () => {
  let service: BillAssignmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BillAssignmentService],
    }).compile();

    service = module.get<BillAssignmentService>(BillAssignmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
