import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { SupabaseRequestService } from 'src/supabase/supabase-request.service';
import { EditProjectDto } from './dto/edit-project.dto';

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

    async updateProject(dto:EditProjectDto, userId: string, projectId:string){
        //1. cari dlu ada atau engga, 
        //2. kalau ga ada throw error
        //3. update pake dto 
        const {data, error} = await this.supabase.client.from('projects').select('*').eq('id',projectId).single()
        if(!data || error){
            throw new NotFoundException('Project Not Found')
        }
        const updatedData = await this.supabase.client.from('projects').update({...dto}).eq('id', projectId).select().single()
        if(!updatedData.data || updatedData.error){
            throw new BadRequestException('Update Failed: '+ updatedData.error.message)
        }
        return updatedData.data
    }

    //protected by role guard
    async getProjectById(projectId:string ){
        const {data, error} = await this.supabase.client.from('projects').select().eq('id',projectId).single()
        if(!data || error){
            throw new NotFoundException('Project Not Found')
        }
        return data
    }
}
