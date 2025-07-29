import {
  CanActivate,
  ExecutionContext,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/modules/auth/services/auth.service';

@Injectable()
export class BelongsToGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // const permissions = this.reflector.get<string[]>('permissions', context.getHandler())
    // if (!permissions) {
    //     return true;
    // }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;
    const userRole = user['role'];
    if (userRole.toUpperCase() == 'admin'.toUpperCase()) {
        return true;
    }
    return false;
  }
}
