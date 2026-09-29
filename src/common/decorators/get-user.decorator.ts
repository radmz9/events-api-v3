import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticadedUser } from '../guards/roles.guard';

export const GetUser = createParamDecorator(
    (data: keyof AuthenticadedUser | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<{ user: AuthenticadedUser }>()
        const user = request.user;

        return data ? user?.[data] : user;
    }
)