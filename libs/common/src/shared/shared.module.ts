import { Module } from '@nestjs/common';
import { AuthTokenGuard } from './guards/auth-token.guard';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from './services/email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './services/queue.service';
import { RelativeTimePipe } from './pipes/relative-time.pipe';
import { SmsService } from './services/sms.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_HOST'),
          port: configService.get('SMTP_PORT'),
          secure: true,
          auth: {
            // Account gmail address
            user: configService.get('SMTP_USER'),
            pass: configService.get('SMTP_PASS'),
          },
          tls: {
            rejectUnauthorized: false,
          },
        },
        defaults: {
          from: configService.get('SMTP_FROM'),
        },
        template: {
          dir: 'src/email_templates',
          adapter: new PugAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    // BullModule.registerQueue({
    //   name: 'email',
    //   connection: {
    //     url: process.env.REDIS_URL,
    //   },

    //   defaultJobOptions: {
    //     priority: 1, // Set default priority
    //     attempts: 3, // Retry 3 times if failed
    //     backoff: { type: 'exponential', delay: 5000 }, // Exponential backoff for retries
    //     removeOnComplete: true, // Remove the job when completed
    //     removeOnFail: true, // Remove the job when it fails
    //     //timeout: 60000, // Set timeout for job execution
    //   },
    // }),
  ],
  providers: [
    AuthTokenGuard,
    JwtService,
    EmailService,
    QueueService,
    RelativeTimePipe,
    SmsService,
  ],
  exports: [
    AuthTokenGuard,
    JwtService,
    EmailService,
    QueueService,
    RelativeTimePipe,
    SmsService,
  ],
})
export class SharedModule {}
