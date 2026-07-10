import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { SupabaseRequestService } from 'src/supabase/supabase-request.service';

@Injectable()
export class ProjectsService {
    constructor(private readonly supabase: SupabaseRequestService){}

    async createProject(dto:CreateProjectDto, userId:string){
        const {data, error} = await this.supabase.client.from('projects').insert({
            ...dto, 
            created_by: userId
        }).select().single()
        if(error) throw new BadRequestException(error.message)
        
        const {error: memberError } = await this.supabase.client.from('project_members').insert({
            project_id: data.id,
            profile_id: userId,
            role: 'LEADER',
            membership_status: 'ACTIVE' 
        })
        if(memberError) throw new BadRequestException('Failed assign Leader: ', memberError.message);

        return data
    }

}
