import { Module } from '@nestjs/common';
import { User } from './models/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService],
})
export class UserModule {}
