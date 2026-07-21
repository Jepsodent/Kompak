import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseRequestService } from 'src/supabase/supabase-request.service';
import { CreateTasksDto } from './dto/create-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignMemberTaskDto } from './dto/assign-member.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TaskStatusService } from './task-status.service';
import { SubmitProofDto } from './dto/submit-proof.dto';
import { ReviewTaskDto } from './dto/review-task.dto';

@Injectable()
export class TasksService{
    
    constructor(private readonly supabase:SupabaseRequestService, private readonly taskStatus: TaskStatusService){}
    
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
            status_id: this.taskStatus.getStatusId('TODO')
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
        const targetStatusCode = this.taskStatus.getStatusId(dto.status) // string id
        const {data:task, error:taskError } = await this.supabase.client.from('tasks').select(`
                task_statuses(code)
            `).eq('id',taskId).eq('project_id',projectId).single()
        if(taskError || !task)throw new NotFoundException('Task not found!')

        if(task.task_statuses.code === 'IN_REVIEW'){
            throw new BadRequestException('Task in Review cannot be dragged. Please use the review button inside task details')
        }

        if(dto.status === 'DONE'){
            throw new BadRequestException('Cannot move task to Done Manually, Leader must approve it via Review')
        }
        if(dto.status === 'IN_REVIEW'){
            const { data: proofData } = await this.supabase.client.from('proof_of_works').select('id').eq('task_id', taskId).maybeSingle();
            if(!proofData) throw new BadRequestException('Please submit proof of work first before moving to In Review')
        }

        const {data, error} = await this.supabase.client.from('tasks').update({
            status_id: targetStatusCode
        }).eq('id',taskId).eq('project_id',projectId).select('id').single()
        if(!data || error) throw new BadRequestException('Failed to update status task: '+ error.message)
        return {message: "Successfully updated task status to "+ dto.status}
    }

    async submitProof(taskId:string, projectId:string, userId:string, dto:SubmitProofDto){
        const {data:status, error: statusError} = await this.supabase.client.from('tasks')
        .select(`
            task_statuses(code)`)
        .eq('id',taskId)
        .eq('project_id',projectId)
        .single()
        if(!status || statusError) throw new NotFoundException('Task not found')

        if(status.task_statuses.code !== 'IN_PROGRESS'){
            throw new BadRequestException('Proof of work can only be submitted when task is In Progress')
        }

        const member = await this.checkValidMember(userId, projectId)
        const {data: proof, error:proofError} = await this.supabase.client.from('proof_of_works').insert({
            task_id: taskId,
            summary_notes: dto.summary_notes,
            submitted_by_member_id: member.id
        }).select('id').single()
        if (!proof || proofError) throw new BadRequestException('Failed to insert proof: '+ proofError.message)
        if(dto.attachments && dto.attachments.length > 0){
            const attachmentPayloads = dto.attachments.map((file) => ({
                proof_of_work_id: proof.id,
                file_name: file.file_name,
                file_url: file.file_url,
                mime_type: file.mime_type
            }))
            const {error:attachError} = await this.supabase.client.from('proof_attachments').insert(attachmentPayloads)
            if(attachError){
                throw new BadRequestException('Failed to save attachments: '+ attachError.message)
            }
        }
        return {message: "Proof of work submitted successfully"}
    }

    async reviewTask(taskId:string, projectId:string, userId:string, dto:ReviewTaskDto){
        const {data:status, error: statusError} = await this.supabase.client.from('tasks')
        .select(`
            task_statuses(code)`)
        .eq('id',taskId)
        .eq('project_id',projectId)
        .single()
        if(!status || statusError) throw new NotFoundException('Task not found')

        if(status.task_statuses.code !== 'IN_REVIEW'){
            throw new BadRequestException('Task must be In Review to be reviewed')
        }

        const member= await this.checkValidMember(userId, projectId)
        const {data:latestProof, error:proofError} = await this.supabase.client.from('proof_of_works').select('id').eq('task_id',taskId).order('submitted_at',{ascending: false}).limit(1).single()
        if(!latestProof || proofError) throw new NotFoundException('Proof of work not found')
        
        const {data, error} = await this.supabase.client.from('task_reviews').insert({
            proof_of_work_id: latestProof.id,
            rating: dto.rating,
            feedback: dto.feedback,
            reviewer_member_id: member.id,
        }).select().single()
        if(!data || error) throw new BadRequestException('Failed to save reviews: ',error.message)
        
        const targetStatusCode = dto.action === 'APPROVE' ? 'DONE' : 'IN_PROGRESS'
        const targetStatusId = this.taskStatus.getStatusId(targetStatusCode)

        const {error: updateTaskError} = await this.supabase.client.from('tasks').update({
            status_id: targetStatusId
        }).eq('id',taskId).eq('project_id',projectId)
        if(updateTaskError) throw new BadRequestException('Failed to update task status after review: ' + updateTaskError.message)
    
        return { 
            message: "Task has been successfully " + (dto.action === 'APPROVE' ? "approved and moved to Done" : "rejected and moved to In Progress") 
        };

    }

}