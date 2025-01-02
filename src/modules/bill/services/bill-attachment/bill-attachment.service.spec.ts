import { Test, TestingModule } from '@nestjs/testing';
import { BillAttachmentService } from './bill-attachment.service';

describe('BillAttachmentService', () => {
  let service: BillAttachmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BillAttachmentService],
    }).compile();

    service = module.get<BillAttachmentService>(BillAttachmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
