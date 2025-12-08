import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { Observable, of } from 'rxjs';
import { RelativeTimePipe } from '../pipes/relative-time.pipe';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    @Inject() private configService: ConfigService,
  ) {}
  public async sendEmailForPasswordReset(data: any) {
    try {
      const emailsList = data['email'];
      const fullname = data['fullname'];
      const otp = data['otp'];
      const expires_at = data['expires_at'];
      const relativeTimePipe = new RelativeTimePipe();
      const relative = relativeTimePipe.transform(expires_at);
      if (!emailsList) {
        throw new Error(`No recipients email found`);
      }

      const sendMailParams: ISendMailOptions = {
        to: emailsList,
        from: this.configService.get('SMTP_FROM') || process.env.SMTP_FROM,
        sender: this.configService.get('SMTP_FROM') || process.env.SMTP_FROM,
        subject: 'Password Reset',
        template: 'password-reset-email-template',
        context: {
          name: fullname,
          otp: otp,
          expires_at: relative,
          resetLink: 'http://localhost:3000/auth/reset-password',
        },
      };
      const response = await this.mailerService.sendMail(sendMailParams);
      this.logger.log(
        `Email sent successfully to recipients with the following parameters : ${JSON.stringify(
          sendMailParams,
        )}`,
        response,
      );
      return {
        success: true,
      };
    } catch (error) {
      this.logger.error(
        `Error while sending mail with the following parameters : ${JSON.stringify(
          data,
        )}`,
        error,
      );
      return {
        success: false,
      };
    }
  }
}
