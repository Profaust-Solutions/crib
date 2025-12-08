import { Processor, WorkerHost } from '@nestjs/bullmq';
import { EmailService } from '../services/email.service';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: any) {
    if (job.name === 'password-reset') {
      await this.emailService.sendEmailForPasswordReset(job.data);
    }
  }
}
