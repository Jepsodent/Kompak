
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { RequestWithUser } from "../../types/user-types";
import { User } from "@supabase/supabase-js";


export const CurrentUser = createParamDecorator(
    (data: unknown, ctx:ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<RequestWithUser>();
        return request.user as User
    }
)