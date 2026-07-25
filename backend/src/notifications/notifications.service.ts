import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SupabaseService } from 'src/supabase/supabase.service';
import { TaskReviewEvent } from './events/task-review.event';
import { ProofSubmittedEvent } from './events/proof-submitted.event';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationsService {
    constructor(private readonly supabase: SupabaseService){}


    //1. listener saat leader selesai review
    @OnEvent('task-reviewed')
    async handleTaskReviewed(event: TaskReviewEvent){
        try {
            const isApprove = event.action === 'APPROVE'
            const title = isApprove ? 'Task Approved!' : 'Task Needs Revision'
            const message = isApprove? `Your proof of work for task ${event.taskTitle} has been approved by the leader and moved to DONE.` : `Your proof of work for task ${event.taskTitle} was rejected by the leader. Feedback: ${event.feedback || 'No feedback provided'}`
    
            await this.supabase.client.from('notifications').insert(
                {
                    profile_id: event.recipentProfileId, 
                    task_id : event.taskId,
                    title, 
                    message, 
                    channel: 'IN_APP',
                    is_read: false,
                }
            )
        } catch (error) {
            console.error(error)
        }

    } 

    @OnEvent('proof-submitted')
    async handleProofSubmitted(event: ProofSubmittedEvent){
        try {
            const {data:leaders} = await this.supabase.client
                .from('project_members')
                .select('profile_id')
                .eq('role', 'LEADER')
                .eq('membership_status', 'ACTIVE')
                .eq('project_id', event.projectId)
            if(!leaders ||  leaders.length === 0) return;
     
            const notificationRows = leaders.map((l) => ({
                profile_id: l.profile_id, 
                task_id: event.taskId,
                title: 'Proof of Work Submitted',
                message: `${event.submitterName} has submitted proof of work for task ${event.taskTitle}.`,
                channel: 'IN_APP',
                is_read: false
            }))
    
            await this.supabase.client.from('notifications').insert(notificationRows)
        } catch (error) {
            console.error('critical event error: ', error)
        }
    }

    async getUserNotifications(userId:string){

        const {data, error}  = await this.supabase.client.from('notifications').select('*,tasks(project_id)').eq('profile_id',userId).order('created_at', {ascending: false})

        if(error) throw new BadRequestException('Failed to fetch notifications: '+error.message)
        return data
    }

    async markAsRead(userId:string, notificationsId:string){
        const {data, error} = await this.supabase.client.from('notifications').update(
            {is_read: true}
        ).eq('id',notificationsId).eq('profile_id', userId).select().single()

        if(error ||!data) throw new NotFoundException('Notificaiton not found or update failed')

        return {message: 'Notification marked as read'}
    }

    @Cron(CronExpression.EVERY_DAY_AT_8AM)
    async handleDeadlineReminder(){
        try {
            
            const now = new Date()
            const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            // dl H-3 (tanggal x jam 23:59:59 malam)
            const threeDaysFromNow = new Date(todayMidnight)
            threeDaysFromNow.setDate(now.getDate() + 3)
            threeDaysFromNow.setHours(23,59,59,999)

            const {data:upcomingTask} = await this.supabase.client.from('tasks').select(
                `id,
                title,
                project_id,
                due_date, 
                status: task_statuses!inner(code),
                project: projects!inner(
                    members: project_members!inner(profile_id, membership_status)
                )`)
                .neq('status.code', 'DONE')
                .eq('project.members.membership_status','ACTIVE')
                .gte('due_date', now.toISOString())
                .lte('due_date', threeDaysFromNow.toISOString())
            
            if(!upcomingTask || upcomingTask.length === 0) return;
            const notificationRows: any[] = []
    
            for (const task of upcomingTask){
                if(!task.due_date) continue;
    
                const dueDate = new Date(task.due_date)
                const dueMidnight = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())

                const diffInTime =  dueMidnight.getTime() - todayMidnight.getTime()
                const diffInDays= Math.round(diffInTime / (1000 * 3600 * 24))
    
                let title = ''
                let message = ''
    
                if (diffInDays === 3){
                    title = 'Reminder Deadline (H-3)';
                    message = `Reminder: Task "${task.title}" is due in 3 days!`;
                }
                else if (diffInDays === 2){
                    title = 'Reminder Deadline (H-2)'
                    message = `Reminder: Task "${task.title}" is due in 2 days!`;
                    
                }
                else if (diffInDays <= 1){
                    title = 'Reminder Deadline (H-1)'
                    message = `Reminder: Task "${task.title}" is due tomorrow!`;
                } else{
                    continue
                }
    
                for (const member of task.project?.members || []){
                    if(member.profile_id){
                        notificationRows.push({
                            profile_id: member.profile_id,
                            task_id: task.id,
                            title,
                            message, 
                            channel: 'IN_APP',
                            is_read: false,
                        })
                    }
                }
            }
            if(notificationRows.length > 0){
                await this.supabase.client.from('notifications').insert(notificationRows)
            }
        } catch (error) {
            console.error(error)
        }
    } 


}
