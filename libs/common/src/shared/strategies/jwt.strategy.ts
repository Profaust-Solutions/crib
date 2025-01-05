import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/modules/auth/services/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService,private authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            expiresIn: '72h',
            secretOrKey: configService.get('jwt.secret_key'),
        });
    }

    async validate(data: any) {
        //console.log(data)
        this.authService.setUserId(data.data.id || '');
        return  data.data;
    }
}