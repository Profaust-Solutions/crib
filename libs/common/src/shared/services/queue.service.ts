import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  //constructor(@InjectQueue('email') private emailQueue: Queue) {}

  // async enqueuePasswordResetEmail(data: any) {
  //   await this.emailQueue.add('password-reset', data, {
  //     attempts: 3,          // retry 3 times on failure
  //     backoff: 5000,        // wait 5s before retry
  //     removeOnComplete: true,
  //     removeOnFail: false,
  //   });
  // }
}
