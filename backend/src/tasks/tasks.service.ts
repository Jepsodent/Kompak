import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { SupabaseRequestService } from 'src/supabase/supabase-request.service';
import { CreateTasksDto } from './dto/create-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignMemberTaskDto } from './dto/assign-member.dto';
import { TaskStatusCode } from 'src/common/enums/task-status.enum';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

@Injectable()
export class TasksService implements OnModuleInit {
    private statusMap = {} as Record<TaskStatusCode,string>;

    constructor(private readonly supabase:SupabaseRequestService){}
    // self healing pattern 
    async onModuleInit() {
        const defaultStatuses = [
            {code: 'TODO', name: 'To Do',sort_order: 1}, 
            {code: 'IN_PROGRESS', name: 'In Progress',sort_order: 2}, 
            {code: 'IN_REVIEW', name: 'In Review',sort_order: 3}, 
            {code: 'DONE', name: 'Done',sort_order: 4}, 
            
        ]
        const {data, error} = await this.supabase.client.from('task_statuses').upsert(
            defaultStatuses, {onConflict: 'code', ignoreDuplicates: true}).select('code,id')
        if(!data || error || data.length === 0){
            throw new Error('Failed to self-heal task_statuses in DB!')
        }
        data.forEach((status) => {
            this.statusMap[status.code] = status.id
        })
        
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
            status_id: this.statusMap['TODO']
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


    //helper for assignMember / unassignMember flow

    private  async checkValidMember(memberId:string, projectId:string){
        const {data:member, error:memberError} = await this.supabase.client.from('project_members').select('id, role')
        .eq('project_id',projectId)
        .eq('membership_status','ACTIVE')
        .or(`profile_id.eq.${memberId},id.eq.${memberId}`)
        .single()
        if(!member || memberError){
            throw new NotFoundException('Target member not found in this project')
        }
        return member
    }

    async assignMemberTask(projectId:string,taskId:string, dto:AssignMemberTaskDto){
        const member =  await this.checkValidMember(dto.memberId, projectId)
        const {data, error} =  await this.supabase.client.from('task_assignees').insert({
            project_member_id: member.id,
            task_id: taskId,
        }).select().single()
        if(error?.code === '23505'){
            throw new ConflictException('Member is already assigned to this task')
        }

        if(!data || error){
            throw new BadRequestException('Failed to assign member: ' + error.message)
        }
        return data
    }

    async unassignMemberTask(projectId:string, taskId:string, memberId:string){
        const member = await this.checkValidMember(memberId, projectId)
        const {data, error} = await this.supabase.client.from('task_assignees').delete().eq('project_member_id', member.id).eq('task_id',taskId).select().maybeSingle()
        
        if(error){
            throw new BadRequestException('Failed to unassign member: '+ error.message)
        }
        if(!data){
            throw new NotFoundException('Member is not assigned to this task.')
        }
        return {message: "Member successfully unassigned from the task."}
    }

    // task update status workflow
    async updateTaskStatus(taskId:string, userId:string, projectId:string, dto:UpdateTaskStatusDto){
        const member = await this.checkValidMember(userId, projectId)
        const targetStatusCode = this.statusMap[dto.status] // string id
        const {data:task, error:taskError } = await this.supabase.client.from('tasks').select(`
                task_statuses(code)
            `).eq('id',taskId).eq('project_id',projectId).single()
        if(taskError || !task)throw new NotFoundException('Task not found!')
        if(dto.status === 'DONE'){
            if(member.role !== 'LEADER'){
                throw new ForbiddenException('Only Leader can move task to DONE')
            }
        }
        else if(dto.status === 'IN_REVIEW'){
            const {data:proofData} = await this.supabase.client.from('proof_of_works').select('id').eq('task_id',taskId).maybeSingle()
            if(!proofData){
                throw new BadRequestException('Please submit proof of work first before moving to In Review.')
            }
        }
        else if((dto.status === 'IN_PROGRESS' || dto.status === 'TODO') && task.task_statuses.code === 'IN_REVIEW'){
            if(member.role !== 'LEADER'){
                throw new ForbiddenException('Only Leader can reject a task back to In Progress.')
            }
        }

        const {data, error} = await this.supabase.client.from('tasks').update({
            status_id: targetStatusCode
        }).eq('id',taskId).eq('project_id',projectId).select('id').single()
        if(!data || error) throw new BadRequestException('Failed to update status task: '+ error.message)
        return {message: "Successfully updated task status to "+ dto.status}
    }


}