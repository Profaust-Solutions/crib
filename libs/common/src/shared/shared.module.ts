import { Module } from '@nestjs/common';
import { AuthTokenGuard } from './guards/auth-token.guard';
import { JwtService } from '@nestjs/jwt';

@Module({
    providers: [AuthTokenGuard,JwtService],
    exports: [AuthTokenGuard, JwtService],
})
export class SharedModule {}
