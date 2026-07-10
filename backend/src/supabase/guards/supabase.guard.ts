import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { SupabaseService } from "../supabase.service";
import { RequestWithUser } from "../../types/user-types";

@Injectable()
export class SupabaseGuard implements CanActivate {
    constructor(private readonly supabaseService: SupabaseService){} //role admin key bypass rls
    
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithUser>(); 
        const token =  request.headers.authorization?.replace('Bearer ','');
        if(!token) throw new UnauthorizedException('No token provided!')
        
        const {data, error} = await this.supabaseService.client.auth.getUser(token);
        if(error || !data.user){
            throw new UnauthorizedException('Invalid or expired token')
        }
        request.user = data.user;
        return true;
    }

}