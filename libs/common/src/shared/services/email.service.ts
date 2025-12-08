import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { Observable, of } from 'rxjs';
import { RelativeTimePipe } from '../pipes/relative-time.pipe';
import { Resend } from 'resend';

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

      const resend = new Resend(this.configService.get('RESEND_API_KEY'));

      const htmlTemplateString = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="en" dir="ltr">
  <head>
    <meta content="width=device-width" name="viewport" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta content="IE=edge" http-equiv="X-UA-Compatible" />
    <meta
      name="format-detection"
      content="telephone=no,address=no,email=no,date=no,url=no"
    />
    <meta name="x-apple-disable-message-reformatting" />
    <title>Password Reset</title>
  </head>

  <body
    style="margin:0;padding:0;background:#ffffff;font-family:-apple-system, BlinkMacSystemFont,'Segoe UI','Roboto','Oxygen','Ubuntu','Cantarell','Fira Sans','Droid Sans','Helvetica Neue',sans-serif;"
  >
    <div
      style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0"
    >
      Reset Your Password Now
    </div>

    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
      <tr>
        <td align="center">
          <table
            width="100%"
            border="0"
            cellspacing="0"
            cellpadding="0"
            role="presentation"
            style="max-width:600px;width:100%;padding:20px;"
          >
            <tr>
              <td>
                <h1
                  style="margin:0;font-size:2.25em;font-weight:600;text-align:center;padding:10px 0;"
                >
                  Password Reset Request
                </h1>

                <p style="margin:0;padding:10px 0;font-size:1em;">
                  Hello <strong>{{name}}</strong>,
                </p>

                <p style="margin:0;padding:10px 0;font-size:1em;">
                  We received a request to reset your password.
                </p>

                <p style="margin:0;padding:10px 0;font-size:1em;">
                  If you made this request, please use the OTP below:
                </p>

                <h3
                  style="margin:0;padding:10px 0;font-size:1.4em;font-weight:600;"
                >
                  OTP: <strong>{{otp}}</strong> <br />
                  <small>Expires {{expires_at}}</small>
                </h3>

                <table
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  role="presentation"
                  style="margin:20px 0;"
                >
                  <tr>
                    <td align="left">
                      <a
                        href="{{resetLink}}"
                        target="_blank"
                        style="background:#000;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:bold;"
                      >
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>

                <hr style="border-top:1px solid #eaeaea;margin:20px 0;" />

                <p style="font-size:1em;margin:0;padding:10px 0;">
                  If you did not request a password reset, you can safely ignore this email.
                </p>

                <p style="font-size:1em;margin:0;padding:10px 0;">
                  This OTP/link will expire soon for your security.
                </p>

                <br />
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

      const response = await resend.emails.send({
        from: this.configService.get('SMTP_FROM') || process.env.SMTP_FROM,
        to: emailsList,
        subject: 'Reset Your Password Now',
        html: htmlTemplateString
          .replace('{{name}}', fullname)
          .replace('{{otp}}', otp)
          .replace('{{expires_at}}', relative)
          .replace('{{resetLink}}', 'http://localhost:3000/auth/reset-password'),
        // template: {
        //   id: 'password-reset-email-template',
        //   variables: {
        //     name: fullname,
        //     otp: otp,
        //     expires_at: relative,
        //     resetLink: 'http://localhost:3000/auth/reset-password',
        //   },
        // },
      });

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
      //const response = await this.mailerService.sendMail(sendMailParams);
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
