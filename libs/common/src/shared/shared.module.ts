import { Module } from '@nestjs/common';
import { AuthTokenGuard } from './guards/auth-token.guard';

@Module({
    providers: [AuthTokenGuard],
    exports: [AuthTokenGuard],
})
export class SharedModule {}
