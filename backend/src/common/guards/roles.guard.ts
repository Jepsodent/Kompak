import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SupabaseRequestService } from "src/supabase/supabase-request.service";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { RequestWithUser } from "src/types/user-types";
import { ProjectRole } from "../enums/project-role.enum";


@Injectable()
export class RoleGuard implements CanActivate{
    constructor(private readonly reflector:Reflector, private supabaseRequest: SupabaseRequestService){}
    async canActivate(context: ExecutionContext):  Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<ProjectRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass()
        ]);
        
        if (!requiredRoles || requiredRoles.length === 0){
            return true
        }

        const request = context.switchToHttp().getRequest<RequestWithUser>();
        const user = request.user
        const projectId = request.params.projectId as string //:projectId
        if(!user || !projectId){
            throw new ForbiddenException('Missing user or project context!')
        }

        const {data, error} = await this.supabaseRequest.client.from('project_members')
                                                                .select('role')
                                                                .eq('project_id',projectId)
                                                                .eq('profile_id', user.id).single()
        if(error || !data){
            throw new ForbiddenException('You are not a member of this project')
        }
        const hasRole = requiredRoles.includes(data.role as ProjectRole)
        if(!hasRole){
            throw new ForbiddenException(`Required one of these roles: ${requiredRoles.join(', ')}`)
        }
        return true
    }

}