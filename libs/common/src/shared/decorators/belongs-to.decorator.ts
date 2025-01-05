import { SetMetadata } from "@nestjs/common";

export const belongsTo = (...hasPermission:string[])=>SetMetadata('permissions',hasPermission);