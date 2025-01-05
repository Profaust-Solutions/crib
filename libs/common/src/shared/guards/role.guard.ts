import { CanActivate, ExecutionContext, forwardRef, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AuthService } from "src/modules/auth/services/auth.service";
import { User } from "src/modules/user/models/user.entity";


@Injectable()
export class RoleGuard implements CanActivate {

    constructor(private reflector: Reflector,
        @Inject(forwardRef(() => AuthService))
        private authService: AuthService) {
    }
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const roles = this.reflector.get<string[]>('roles', context.getHandler())
        if (!roles) {
            return true;
        }
        // const request = context.switchToHttp().getRequest();
        // const account: User = request.user;
        
        // this.authService.findOneUser(account.id).pipe(
        //     map((account: User) => {

        //     })
        // )

        // return this.authService.findRole(account.roleId).pipe(
        //     map((role: Role) => {
        //         const hasRole = () => roles
        //             .map((r) => {
        //                 return r.toLowerCase();
        //             })
        //             .includes(role.title.toLowerCase());

        //         return role && hasRole();
        //     })
        // );
    }

}