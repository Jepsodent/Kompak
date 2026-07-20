import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { SupabaseRequestService } from 'src/supabase/supabase-request.service';
import { CreateTasksDto } from './dto/create-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService implements OnModuleInit {
    private defaultTodoStatusId!:string;

    constructor(private readonly supabase:SupabaseRequestService){}
    // self healing pattern 
    async onModuleInit() {
        let {data} = await this.supabase.client.from('task_statuses').select('id').eq('code', 'TODO').maybeSingle()
        if(!data){
            const {data:newStatus, error} = await this.supabase.client.from('task_statuses').insert({
                code: 'TODO', 
                name: 'To Do',
                sort_order: 1,
            })
            .select('id')
            .single()
            if(error || !newStatus) throw new Error('Failed to auto create TODO status in DB!')
            data = newStatus
        }
        this.defaultTodoStatusId = data.id
    }


    

    async createTask(projectId:string, dto:CreateTasksDto, userId:string){
        const {data:member, error:memberError} = await this.supabase.client.from('project_members').select('id').eq('project_id', projectId).eq('profile_id', userId).eq('membership_status', 'ACTIVE').single()
        if(!member || memberError){
            throw new NotFoundException('Project member not found')
        }
        //ga perlu query kyk gini lagi , terapin in memory caching DP di moduleInit
        // const {data: status, error:statusError} = await this.supabase.client.from('task_statuses').select('id').eq('code', 'TODO').single()
        // if (!status || statusError) {
        //     throw new InternalServerErrorException('Default task status (TODO) is missing in database');
        // }
        const {data, error} = await this.supabase.client.from('tasks').insert({
            ...dto, 
            project_id: projectId,
            created_by_member_id: member.id,
            status_id: this.defaultTodoStatusId
        }).select().single()
        if(!data || error){
            throw new BadRequestException('Failed to create task: '+ error.message)
        }
        return data
    }

    async getAllTasks(projectId:string){
        const {data, error} = await this.supabase.client.from('tasks').select(`
            id,
            title,
            due_date,
            status: task_statuses(id,code,name),
            assignees: task_assignees(
                    member: project_members(
                        profile: profiles(
                            name,
                            profile_image_url
                        )
                    )
                )
            `).eq('project_id', projectId)
        if(error) throw new BadRequestException('Failed to fetch tasks: '+ error.message)
        return data
    }

    async getTaskById(projectId:string, taskId:string){
        const {data, error} = await this.supabase.client.from('tasks').select(`
            id,
            title,
            description,
            due_date,
            source,
            created_at,
            updated_at,
            status: task_statuses(id, code, name),
            created_by: project_members!created_by_member_id (
                profile: profiles(
                    name,
                    profile_image_url
                )
            ),
            assignees: task_assignees(
                member: project_members(
                    profile: profiles(
                        name,
                        profile_image_url
                    )
                )
            ),
            proof_work: proof_of_works(
                id,
                summary_notes,
                submitted_at,
                submitted_by: project_members!submitted_by_member_id (
                    profile: profiles(
                        name,
                        profile_image_url
                    )
                ),
                attachments: proof_attachments(
                    id,
                    file_name,
                    file_url,
                    mime_type
                ),
                review: task_reviews(
                    id,
                    feedback,
                    rating,
                    reviewer: project_members!reviewer_member_id (
                        profile: profiles(
                            name,
                            profile_image_url
                        )
                    )
                )
            ),  
            `).eq('project_id', projectId).eq('id',taskId).single()
        if(error || !data){
            throw new NotFoundException('Task not found')
        }
        return data
    }

    async updateTask(projectId:string, taskId:string, dto:UpdateTaskDto){
        const {data, error} =  await this.supabase.client.from('tasks').update({
            ...dto, 
        }).eq('id',taskId).eq('project_id', projectId).select().maybeSingle()
        if(error) throw new BadRequestException('Update failed: '+ error.message)
        if(!data) throw new NotFoundException('Task not found')
        return data
    }

    async deleteTask(projectId:string,  taskId:string){
        const {data, error} =  await this.supabase.client.from('tasks').delete().eq('project_id',projectId).eq('id',taskId).select().maybeSingle()
        if(error){
            throw new BadRequestException('Delete failed: '+error.message)
        }
        if(!data) throw new NotFoundException('Task not found in this project')
        return {message: 'Task has been successfully deleted'}

    }

}
