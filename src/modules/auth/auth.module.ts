import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserService } from '../user/services/user.service';
import { JwtStrategy } from '@app/common/shared/strategies/jwt.strategy';
import {ConfigService } from '@nestjs/config';
import { ConfigModule } from '@app/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpAuthentication } from './models/otp-authentication.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OtpAuthentication]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.secret_key'),
        signOptions: {
          expiresIn: '700000s',
        },
      }),
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
