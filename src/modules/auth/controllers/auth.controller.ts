import { ApiResponse, ResponseCodes } from "@app/common/shared/models/api-response";
import { Controller, Logger, Post, Header, Body } from "@nestjs/common";
import { Observable, map } from "rxjs";
import { UserService } from "src/modules/user/services/user.service";
import { LoginDto } from "../models/login-dto";
import { AuthService } from "../services/auth.service";

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(public userService: UserService, public authService: AuthService) {}
  @Post('login')
  //@AuditLog('Login')
  @Header('Cache-Control', 'none')
  login(@Body() data: LoginDto): Observable<ApiResponse> {
      let response = new ApiResponse();
      const username = data.username;
      const password = data.password;
          const loginResult$ = this.authService.loginWithUsernameAndPassword(username, password);

          return loginResult$.pipe(map((loginResult: any) => {
             // console.log(loginResult)
              if (loginResult) {
                  response.code = ResponseCodes.SUCCESS.code;
                  response.message = ResponseCodes.SUCCESS.message;
                  response.data = {
                      ...loginResult,
                  }
              } else {
                  response.code = ResponseCodes.AUTHENTICATION_FAILED.code;
                  response.message = ResponseCodes.AUTHENTICATION_FAILED.message;
              }
              return response;
          }))
  }

  @Post('refreshtoken')
  //@AuditLog('Refresh Token')
  @Header('Cache-Control', 'none')
  refreshToken(@Body() data: any): Observable<ApiResponse> {
      let response = new ApiResponse();
      const id = data.id;
      const refreshTokenResult$ = this.authService.refreshToken(id);
      return refreshTokenResult$.pipe(map((loginResult: any) => {
          if (loginResult) {
              response.code = ResponseCodes.SUCCESS.code;
              response.message = ResponseCodes.SUCCESS.message;
              response.data = {
                  token: loginResult,
              }
          } else {
              response.code = ResponseCodes.AUTHENTICATION_FAILED.code;
              response.message = ResponseCodes.AUTHENTICATION_FAILED.message;
          }
          return response;
      }))
  }
}