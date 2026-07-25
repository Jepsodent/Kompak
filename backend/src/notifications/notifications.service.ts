import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SupabaseService } from 'src/supabase/supabase.service';
import { TaskReviewEvent } from './events/task-review.event';
import { ProofSubmittedEvent } from './events/proof-submitted.event';

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

        const {data, error}  = await this.supabase.client.from('notifications').select('*').eq('profile_id',userId).order('created_at', {ascending: false})

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

}
