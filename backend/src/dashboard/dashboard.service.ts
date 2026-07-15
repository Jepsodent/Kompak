import { BadRequestException, Injectable } from '@nestjs/common';
import { DueSoonTask, RecentProjectRow, TaskAssigneeWithDetails } from 'src/common/interface/dashboard.interface';
import { SupabaseRequestService } from 'src/supabase/supabase-request.service';

@Injectable()
export class DashboardService {
    constructor(private readonly supabase:SupabaseRequestService){}


    async getDashboardStat(userId:string){
        
        const [totalProjects, taskWorkload, recentProjects] = await Promise.all([
            this.getTotalActiveProjects(userId),
            this.getTaskWorkload(userId),
            this.getRecentProjects(userId)
        ])
        return {

            total_projects: totalProjects,
            my_total_tasks: taskWorkload.unfinished_count,
            tasks_due_soon: taskWorkload.due_soon,
            recent_projects: recentProjects
        }
    }

    private async getTotalActiveProjects(userId:string): Promise<number>{ 
        const {count, error} = await this.supabase.client.from('project_members').select('id', {count: 'exact', head: true}).eq('profile_id',userId).eq('membership_status','ACTIVE');
        if(error) throw new BadRequestException(error.message)
        
        return count ?? 0;
    }
    private async getTaskWorkload(userId:string): Promise<{unfinished_count: number; due_soon:DueSoonTask[];}> {
        const {data: memberships, error: memberError} = await this.supabase.client.from('project_members').select('id').eq('profile_id',userId).eq('membership_status','ACTIVE')
        if(memberError) throw new BadRequestException(memberError.message);
        if(!memberships || memberships.length === 0){
            return {unfinished_count: 0, due_soon: []};
        }

        const memberIds = memberships.map((m) => m.id)

        const {data: assignments, error: taskError} = await this.supabase.client.from('task_assignees')
                                                                                .select('task_id,tasks(id,title,due_date, project_id, task_statuses(code), projects(title))').in('project_member_id',memberIds)
                                                                                .returns<TaskAssigneeWithDetails[]>();
        if(taskError) throw new BadRequestException(taskError.message)
        const unfinishedTasks =  assignments.filter((a) => a.tasks && a.tasks.task_statuses?.code !== 'DONE')
        const now = new Date()
        const sevenDaysFromNow = new Date()
        sevenDaysFromNow.setDate(now.getDate() + 7);
        
        const dueSoon:DueSoonTask[] = unfinishedTasks.filter((a) => {
            if(!a.tasks?.due_date) return false
            const dueDate =  new Date(a.tasks.due_date)
            return dueDate  >= now && dueDate <= sevenDaysFromNow
        }).map((a) => ({
            id:  a.tasks!.id,
            title: a.tasks!.title,
            due_date: a.tasks!.due_date as string,
            project_title: a.tasks!.projects?.title,
        })).sort((a,b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

        return{ 
            unfinished_count: unfinishedTasks.length,
            due_soon: dueSoon
        }
    }
    private async getRecentProjects(userId:string){
        const {data, error}= await this.supabase.client.from('project_members').select('joined_at, projects(id,title)').eq('profile_id',userId).eq('membership_status', 'ACTIVE').order('joined_at', {ascending: false}).limit(5).returns<RecentProjectRow[]>();
        if(error) throw new BadRequestException(error.message)
        
        const recentProjects =  data.filter((item) => item.projects !== null)
        const projectIds =  recentProjects.map((item) => item.projects!.id)
        if(projectIds.length === 0) return []

        const {data:allMembers, error:memberError} = await this.supabase.client.from('project_members').select('project_id, profiles(profile_image_url)').in('project_id', projectIds).eq('membership_status','ACTIVE')
        if(memberError) throw new BadRequestException(memberError.message)


        return recentProjects.map((item) => ({
            id: item.projects!.id,
            title: item.projects!.title,
            joined_at: item.joined_at,
            member_profile_image: allMembers.filter((m) => m.project_id === item.projects!.id)
                                            .map((m) => m.profiles.profile_image_url)
                                            .filter(Boolean)
        }))
    

    }




}
