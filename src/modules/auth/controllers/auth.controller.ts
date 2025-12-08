import {
  ApiResponse,
  ResponseCodes,
} from '@app/common/shared/models/api-response';
import {
  Controller,
  Logger,
  Post,
  Header,
  Body,
  HttpCode,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { UserService } from 'src/modules/user/services/user.service';
import { LoginDto } from '../models/login-dto';
import { AuthService } from '../services/auth.service';
import { OtpAuthentication } from '../models/otp-authentication.entity';
import { PasswordResetRequest } from '../models/password-reset-request.entity';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    public userService: UserService,
    public authService: AuthService,
  ) {}
  @Post('login')
  //@AuditLog('Login')
  @Header('Cache-Control', 'none')
  login(@Body() data: LoginDto): Observable<ApiResponse> {
    let response = new ApiResponse();
    const username = data.username;
    const password = data.password;
    const loginResult$ = this.authService.loginWithUsernameAndPassword(
      username,
      password,
    );

    return loginResult$.pipe(
      map((loginResult: any) => {
        // console.log(loginResult)
        if (loginResult) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;
          response.data = {
            ...loginResult,
          };
        } else {
          response.code = ResponseCodes.AUTHENTICATION_FAILED.code;
          response.message = ResponseCodes.AUTHENTICATION_FAILED.message;
        }
        return response;
      }),
    );
  }

  @Post('refreshtoken')
  //@AuditLog('Refresh Token')
  @Header('Cache-Control', 'none')
  refreshToken(@Body() data: any): Observable<ApiResponse> {
    let response = new ApiResponse();
    const id = data.id;
    const refreshTokenResult$ = this.authService.refreshToken(id);
    return refreshTokenResult$.pipe(
      map((loginResult: any) => {
        if (loginResult) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;
          response.data = {
            token: loginResult,
          };
        } else {
          response.code = ResponseCodes.AUTHENTICATION_FAILED.code;
          response.message = ResponseCodes.AUTHENTICATION_FAILED.message;
        }
        return response;
      }),
    );
  }

  @Post('sendotp')
  //@AuditLog('sendotp')
  @Header('Cache-Control', 'none')
  sendOtp(@Body() data: OtpAuthentication): Observable<ApiResponse> {
    let response = new ApiResponse();
    const createdOtpResult$ = this.authService.createOpt(data);
    return createdOtpResult$.pipe(
      map((createdOtpResult: any) => {
        if (createdOtpResult) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;
          response.data = {
            ...createdOtpResult,
          };
        } else {
          response.code = ResponseCodes.AUTHENTICATION_FAILED.code;
          response.message = ResponseCodes.AUTHENTICATION_FAILED.message;
        }
        return response;
      }),
    );
  }

  @Post('verifyotp')
  @HttpCode(200)
  verifyOtp(@Body() data: any): Observable<ApiResponse> {
    let response = new ApiResponse();
    const mobileNumber = data.mobile_number;
    const otp = data.otp;
    const verifyOtpResult$ = this.authService.verifyOtp(mobileNumber, otp);

    return verifyOtpResult$.pipe(
      map((verifyOtpResult: boolean) => {
        console.log(verifyOtpResult);
        if (verifyOtpResult) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;
          response.data = verifyOtpResult;
        } else {
          response.code = ResponseCodes.AUTHENTICATION_FAILED.code;
          response.message = ResponseCodes.AUTHENTICATION_FAILED.message;
          response.data = verifyOtpResult;
        }
        return response;
      }),
    );
  }

  @Post('reset-password-request')
  passwordRestRequest(
    @Body() data: PasswordResetRequest,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    const passwordResetResult$ = this.authService.createPasswordReset(data);

    return passwordResetResult$.pipe(
      map((passwordResetResult: PasswordResetRequest) => {
        //console.log(passwordResetResult);
        if (passwordResetResult) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;
          response.data = passwordResetResult;
        } else {
          response.code = ResponseCodes.AUTHENTICATION_FAILED.code;
          response.message = ResponseCodes.AUTHENTICATION_FAILED.message;
          response.data = passwordResetResult;
        }
        return response;
      }),
    );
  }
}
