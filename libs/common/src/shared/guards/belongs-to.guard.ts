import { CanActivate, ExecutionContext, forwardRef, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { AuthService } from "src/modules/auth/services/auth.service";
import { User } from "src/modules/user/models/user.entity";

@Injectable()
export class BelongsToGuard implements CanActivate {

    constructor(private reflector: Reflector,
        @Inject(forwardRef(() => AuthService))
        private authService: AuthService) {
    }
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        // const permissions = this.reflector.get<string[]>('permissions', context.getHandler())
        // if (!permissions) {
        //     return true;
        // }
        const request = context.switchToHttp().getRequest();
        const account: User = request.user;
        const params = request.params;

        return true;

        

    }

}