import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class EventTokenGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService){}

    async canActivate(context: ExecutionContext): Promise<boolean>{
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extracTokenFromHeader(request);

        if(!token){
            throw new UnauthorizedException({ event_token: 'No se proporciono el token del evento' });
        }

        try {
            const payload = await this.jwtService.verifyAsync<Record<string, any>>(token, {
                secret: process.env.JWT_EVENT_SECRET,
            });

            request['event'] = payload;
        } catch (error) {
            console.log('Error', error)
            throw new UnauthorizedException({ event_token: 'Token de evento invalido o expirado' })
        }

        return true;
    }

    private extracTokenFromHeader(request: Request): string | undefined{
        const header = request.headers['x-event-token'];
        if(!header || Array.isArray(header)) return undefined;

        const [type, token] = header.split(' ');
        return type === 'Bearer' ? token : undefined;
    }
}