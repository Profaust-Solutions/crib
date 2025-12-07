import {
  ApiResponse,
  ResponseCodes,
} from '@app/common/shared/models/api-response';
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Observable, iif, map, switchMap } from 'rxjs';
import { User } from '../models/user.entity';
import { UserService } from '../services/user.service';
import { UpdateResult } from 'typeorm';
import { AuthTokenGuard } from '@app/common/shared/guards/auth-token.guard';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(public userService: UserService) {}
  @Post('create')
  //@AuditLog('Create User')
  @Header('Cache-Control', 'none')
  create(@Body() user: User): Observable<ApiResponse> {
    let response = new ApiResponse();
    const createdUserResult$ = this.userService.create(user);
    return createdUserResult$.pipe(
      map((createdUser: User) => {
        response.code = ResponseCodes.SUCCESS.code;
        response.message = ResponseCodes.SUCCESS.message;
        response.data = { ...createdUser };
        return response;
      }),
    );
  }

  @Get('')
  // @AuditLog('Get Users')
  @Header('Cache-Control', 'none')
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();

    return this.userService.findAll({ page, limit }).pipe(
      map((usersPagable) => {
        const userItems = usersPagable.items;
        const userItemsMeta = usersPagable.meta;
        if (userItems.length > 0) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;
          response.data = userItems;
          response.meta = userItemsMeta;
        } else {
          response.code = ResponseCodes.NO_RECORD_FOUND.code;
          response.message = ResponseCodes.NO_RECORD_FOUND.message;
        }
        return response;
      }),
    );
  }

  @UseGuards(AuthTokenGuard)
  @Get(':userId')
  //@AuditLog('Get User')
  @Header('Cache-Control', 'none')
  findOne(
    @Param('userId') userId: string,
    @Req() requset,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    const user = requset.user;
    userId = user['id'];
    //console.log('user: ' + JSON.stringify(user));
    const findById$ = this.userService.findOne(userId);
    const findByMobileNumber$ = this.userService.findByMobileNumber(userId);
    return iif(() => userId.length > 19, findById$, findByMobileNumber$).pipe(
      map((user) => {
        try {
          if (user.hasId) {
            response.code = ResponseCodes.SUCCESS.code;
            response.message = ResponseCodes.SUCCESS.message;
            response.data = user;
          } else {
            response.code = ResponseCodes.NO_RECORD_FOUND.code;
            response.message = ResponseCodes.NO_RECORD_FOUND.message;
          }
        } catch (e) {
          response.code = ResponseCodes.EXPECTION_ERROR.code;
          response.message = `${ResponseCodes.EXPECTION_ERROR.message}: ${e.message}`;
        }

        return response;
      }),
    );
  }

  @UseGuards(AuthTokenGuard)
  @Put(':userId')
  //@AuditLog('Update User')
  @Header('Cache-Control', 'none')
  update(
    @Param('userId') userId: string,
    @Body() user: User,
    @Req() requset,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    userId = requset.user['id'];
    user.id = userId;
    return this.userService.update(user).pipe(
      switchMap((user: UpdateResult) => {
        if (user.affected > 0) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;

          return this.userService.findOne(userId).pipe(
            map((user) => {
              if (user.hasId) {
                response.code = ResponseCodes.SUCCESS.code;
                response.message = ResponseCodes.SUCCESS.message;
                response.data = user;
              } else {
                response.code = ResponseCodes.NO_RECORD_FOUND.code;
                response.message = ResponseCodes.NO_RECORD_FOUND.message;
              }
              return response;
            }),
          );
        } else {
          response.code = ResponseCodes.FAILED.code;
          response.message = ResponseCodes.FAILED.message;
        }
      }),
    );
  }

  @UseGuards(AuthTokenGuard)
  @Delete(':userId')
  //@AuditLog('Delete user')
  @Header('Cache-Control', 'none')
  delete(
    @Param('userId') userId: string,
    @Req() requset,
  ): Observable<ApiResponse> {
    let response = new ApiResponse();
    userId = requset.user['id'];
    return this.userService.softDelete(userId).pipe(
      map((role) => {
        if (role.affected > 0) {
          response.code = ResponseCodes.SUCCESS.code;
          response.message = ResponseCodes.SUCCESS.message;
        } else {
          response.code = ResponseCodes.NO_RECORD_FOUND.code;
          response.message = ResponseCodes.NO_RECORD_FOUND.message;
        }
        return response;
      }),
    );
  }
}
