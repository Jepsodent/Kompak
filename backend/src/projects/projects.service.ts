import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { SupabaseRequestService } from 'src/supabase/supabase-request.service';
import { EditProjectDto } from './dto/edit-project.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ProjectRole } from 'src/common/enums/project-role.enum';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { DashboardStats, TaskDistribution, TaskWithStatus } from '../common/interface/project.interface';



@Injectable()
export class ProjectsService {
    constructor(private readonly supabase: SupabaseRequestService, private readonly jwtService:JwtService, private readonly configService:ConfigService){}

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

    async deleteProject(projectId:string){
        const {data, error} = await this.supabase.client.from('projects').select().eq('id',projectId).single()
        if(!data || error){
            throw new NotFoundException('Project Not Found')
        }
        const {error: deletedError} = await this.supabase.client.from('projects').delete().eq('id',projectId)
        if(deletedError){
            throw new BadRequestException('Delete Failed: '+ deletedError?.message )
        }
        return {message: `Project ${data.title} successfully deleted`}        
    }

    generateInvitation(projectId:string){
        const token = this.jwtService.sign({projectId})
        const frontendUrl = this.configService.get<string>("FRONTEND_URL")
        return `${frontendUrl}/invitations/${token}`
    }
    verifyToken(token:string): {projectId:string} {
        try {
            const payload = this.jwtService.verify<{projectId:string}>(token); 
            return payload
        } catch (error) {
            if(error instanceof Error && error.name === 'TokenExpiredError'){
                throw new BadRequestException('Invitation Link has already expired')
            }
            throw new BadRequestException("Invalid Invitation Link!")
            
        }
    }
    async joinInvitation(token:string, userId:string){
        const payload =  this.verifyToken(token)
        const {data:existingMember} =  await this.supabase.client.from('project_members').select('id').eq('project_id',payload.projectId).eq('profile_id',userId).single()
        if(existingMember){
            throw new ConflictException('You have already become a member of the project')
        }
        const{data, error} = await this.supabase.client.from('project_members').insert({
            project_id: payload.projectId,
            profile_id: userId,
            role: ProjectRole.MEMBER,
            membership_status: 'ACTIVE'
        }).select().single()
        if(error) throw new BadRequestException(error.message)
        return data;
    }

    // get all members whtever the status is (active)
    async getAllMember(projectId:string){
        const {data:project,  error:projectError} = await this.supabase.client.from('projects').select().eq('id',projectId).single()
        if(projectError || !project){
            throw new NotFoundException('Project not found')
        }
        const {data, error} = await this.supabase.client.from('project_members').select('*, profiles(name,email,profile_image_url)').eq('project_id',projectId).eq('membership_status','ACTIVE')
        if(error) throw new BadRequestException(error.message)
        return data;
    }

    async updateMemberRole(projectId:string, memberId:string, dto:UpdateMemberRoleDto, userId:string){
        const {data:project, error:errorProject} = await this.supabase.client.from('projects').select().eq('id',projectId).single()
        if(!project || errorProject){
            throw new NotFoundException('Project not found')
        }
        if(memberId === userId && dto.role === ProjectRole.MEMBER){
            const {data:leader} = await this.supabase.client.from('project_members').select().eq('project_id',projectId).eq('membership_status','ACTIVE').eq('role',ProjectRole.LEADER)

            if(leader && leader.length <= 1){
                throw new BadRequestException("There must be at least one Leader in the project")
            }
        }
        const {data, error} = await this.supabase.client.from('project_members').update({role: dto.role}).eq('project_id',projectId).eq('profile_id',memberId).select().single()
        if(error) throw new BadRequestException(error.message)
        return data
    }

    async deleteMember(projectId:string, memberId:string){
        const {data:project, error:errorProject} =  await this.supabase.client.from('projects').select('id').eq('id',projectId).single()
        if(!project|| errorProject) throw new NotFoundException('Project not found')
        
        const {data:memberProject, error:memberError} = await this.supabase.client.from('project_members').select('role').eq('profile_id',memberId).eq('project_id',projectId).single()
        
        if(!memberProject || memberError){
            throw new NotFoundException("Member not found")
        }
        if(memberProject.role === (ProjectRole.LEADER as string)){
            const {data:leader} =  await this.supabase.client.from('project_members').select('id').eq('project_id',projectId).eq('membership_status','ACTIVE').eq('role',ProjectRole.LEADER)
            if(leader && leader.length <= 1){
                throw new BadRequestException('There must be at least one Leader in the project')
            }
        }
    
        const {data, error} = await this.supabase.client.from('project_members').delete().eq('profile_id',memberId).eq('project_id',projectId).select().single()
        if(error || !data){
            throw new NotFoundException("Member not found")
        }
        return data
    }


    //quick-link management
    async createLink(projectId:string, userId:string, dto:CreateLinkDto){
        const {data:project, error:errorProject} = await this.supabase.client.from('projects').select('id').eq('id',projectId).single()
        if(!project || errorProject ) {
            throw new NotFoundException('Project not found')
        }
        const {data:member, error:memberError} = await this.supabase.client.from('project_members').select('id').eq('profile_id', userId).eq('project_id',projectId).eq('membership_status','ACTIVE').single()
        
        if(!member || memberError){
            throw new NotFoundException('Member not found')
        }

        const {data, error} = await this.supabase.client.from('quick_links').insert({
            ...dto,
            created_by_member_id: member.id ,
            project_id: projectId,
        }).select('*, project_members!created_by_member_id(profiles(name))').single()


        if(!data || error){
            throw new BadRequestException(error?.message ?? 'Failed to create link')
        }
        return data
    }

    async updateLink(projectId:string,quickLinkId:string,  userId:string, dto:UpdateLinkDto){
        const {data:project, error:errorProject} = await this.supabase.client.from('projects').select('id').eq('id',projectId).single()
        if(!project || errorProject ) {
            throw new NotFoundException('Project not found')
        }
        const {data:member, error:memberError} = await this.supabase.client.from('project_members').select('id').eq('profile_id', userId).eq('project_id',projectId).eq('membership_status','ACTIVE').single()
        if(!member || memberError){
            throw new NotFoundException('Member not found')
        }
        const {data, error} = await this.supabase.client.from('quick_links').update({
            ...dto,
            updated_by_member_id: member.id,
            updated_at: new Date().toISOString(),
        }).eq('id',quickLinkId).eq('project_id',projectId).select('*, project_members!created_by_member_id(profiles(name))').single()

        if(!data || error){
            throw new BadRequestException(error?.message ?? 'Failed to update link')
        }
        return data    
    }

    async deleteLink(projectId:string, quickLinkId:string){
        const {data:project, error:errorProject} = await this.supabase.client.from('projects').select('id').eq('id',projectId).single()
        if(!project || errorProject ) {
            throw new NotFoundException('Project not found')
        }
        const {data,error }=  await this.supabase.client.from('quick_links').delete().eq('id',quickLinkId).eq('project_id',projectId).select().single()
        if(!data || error){
            throw new BadRequestException(error?.message ?? 'Failed to delete link')
        }
        return {
            message: 'Quick link successfully deleted'
        }
    }
    
    async getProjectDashboard(projectId:string){
        const {data:project , error:projectError} = await this.supabase.client.from('projects').select('id').eq('id',projectId).single()
        if(!project || projectError){
            throw new NotFoundException('Project not found')
        }
        const [taskResults, quickLinksResult, membersResult] = await Promise.all([
            this.getTaskStats(projectId),
            this.getQuickLinks(projectId),
            this.getMembers(projectId),
        ])
        return {
            stats: {
                total_tasks: taskResults.total_tasks,
                completion_rate: taskResults.completion_rate,
                task_distribution: taskResults.task_distribution
            },
            tasks: taskResults.tasks,
            quick_links: quickLinksResult,
            members: membersResult
        }

    }
    private async getTaskStats(projectId:string): Promise<DashboardStats>{
        const {data: tasks, error} = await this.supabase.client.from('tasks').select('id,title,due_date, task_statuses(code)').eq('project_id',projectId).returns<TaskWithStatus[]>();
        if(error){
            throw new BadRequestException(error.message)
        }
        const totalTasks = tasks.length
        const taskDistribution: TaskDistribution = {
            TODO: 0,
            IN_PROGRESS: 0,
            IN_REVIEW: 0,
            DONE: 0
        }
        for (const task of tasks){
            const statusCode = task.task_statuses?.code;
            if(statusCode && statusCode in taskDistribution){
                taskDistribution[statusCode as keyof TaskDistribution]++;
            }
        }
        const done_tasks = taskDistribution.DONE
        const completion_rate = totalTasks > 0 ? Math.round((done_tasks / totalTasks) * 100) : 0;
        
        return {
            total_tasks: totalTasks,
            completion_rate,
            tasks: tasks || [],
            task_distribution: taskDistribution
        }
    }
    
    private async getQuickLinks(projectId:string){
        const {data, error} = await this.supabase.client.from('quick_links')
            .select(`
                *,
                creator:project_members!created_by_member_id(profiles(name, profile_image_url)),
                updater:project_members!updated_by_member_id(profiles(name, profile_image_url))
            `)
            .eq('project_id', projectId)
            
        if(error) throw new BadRequestException(error.message)
        return data
    }


    private async getMembers(projectId:string){
        const {data, error} = await this.supabase.client.from('project_members').select('*, profiles(name, profile_image_url, email)').eq('project_id',projectId).eq('membership_status','ACTIVE')
        if(error) throw new BadRequestException(error.message)
        return data
    }


}
