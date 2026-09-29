import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthenticadedUser } from 'src/common/guards/roles.guard';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt'){
    constructor(private config: ConfigService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get<string>('JWT_SECRET')!
        })
    }

    validate(payload: AuthenticadedUser){
        const userForRequest ={
            sub: payload.sub,
            user: payload.user,
            role: payload.role,
            idArea: payload.idArea,
        }
        return userForRequest;
    }
}