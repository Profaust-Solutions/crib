import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    @Inject() private configService: ConfigService,
    @Inject() private readonly httpService: HttpService,
  ) {}

  public sendOtpMessage(
    mobileNumber: string,
    otp: string,
  ): Observable<AxiosResponse> {
    const senderId = this.configService.get('SMS_SENDER_ID');
    const apiKey = this.configService.get('SMS_API_KEY');
    const apiUrl = this.configService.get('SMS_API_URL');
    let template = this.configService.get('OTP_SMS_TEMPLATE');

    template = template.replace('OTP', otp);

    const smsPayload = {
      message: template,
      to: mobileNumber,
      from: senderId,
    };
    let requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    };

    this.logger.log(smsPayload);

    return this.httpService.post(apiUrl, smsPayload, requestConfig);
  }
}
