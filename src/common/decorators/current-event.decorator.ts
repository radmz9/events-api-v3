import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface EventPayload {
    event: number;
    iat?: number;
    exp?: number;
}

export const CurrentEvent = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): number | undefined => {
        const request = ctx.switchToHttp().getRequest<Request & { event: EventPayload }>();
        const payload = request.event;

        return payload ? payload.event : undefined;
    }
)