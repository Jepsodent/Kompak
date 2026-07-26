import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseRequestService } from 'src/supabase/supabase-request.service';

@Injectable()
export class ReportsService {
    constructor(private readonly supabase:SupabaseRequestService){}


    async generateContributionPaper(projectId:string, userId: string){

        const [membersResponse, tasksResponse] = await Promise.all([
            this.supabase.client.from('project_members')
            .select(`
                id,
                role,
                profile_id,
                profiles(name, profile_image_url)
            `)
            .eq('project_id',projectId)
            .eq('membership_status', 'ACTIVE')
            , 
            this.supabase.client.from('tasks')
            .select(`
                id,
                title,
                status: task_statuses(code),
                assignees: task_assignees(project_member_id), 
                proofs: proof_of_works(
                    submitted_by_member_id, 
                    reviews: task_reviews(rating)
                )
            `)
            .eq('project_id', projectId)
        ])
        if(membersResponse.error || !membersResponse.data) throw new BadRequestException('Failed to fetch project members: '+membersResponse.error.message)
        if(tasksResponse.error || !tasksResponse.data) throw new BadRequestException('Failed to fetch project tasks: '+tasksResponse.error.message)

        const members = membersResponse.data
        const tasks = tasksResponse.data

        const membersContribution = members.map((member) => {
            // ambil task yg di assign ke mmeber ini
            const memberTask = tasks.filter((t) => t.assignees?.some(assignee => assignee.project_member_id === member.id))
            

            const completedTask = memberTask.filter((task) => task.status?.code === 'DONE')
            const completedTitles = completedTask.map(task => task.title)

            const ratings: number[]= [] 
            tasks.forEach((task) => {
                const proofs = Array.isArray(task.proofs) ? task.proofs : task.proofs ? [task.proofs] : [];

                proofs.forEach((proof)=> {
                    if(proof.submitted_by_member_id === member.id){
                        const reviews = Array.isArray(proof.reviews) ? proof.reviews : proof.reviews ? [proof.reviews] : [];
                        reviews.forEach((review) => {
                            if(typeof review.rating === 'number'){
                                ratings.push(review.rating)
                            }
                        })
                    }

                })
            })
            const avgRating = ratings.length > 0 ? Number((ratings.reduce((prev, curr) => prev + curr, 0) / ratings.length).toFixed(1)) : 0

            return {
                member_id: member.id,
                name: member.profiles?.name || 'Unknown',
                role: member.role,
                total_assigned: memberTask.length,
                completed_count: completedTitles.length, 
                completed_titles: completedTitles,
                average_rating: avgRating
            }
        })
        const contentJson = {
            generated_at: new Date().toISOString(),
            project_id: projectId,
            total_project_tasks: tasks.length, 
            members_contribution: membersContribution
        }
        const creatorMember = members.find((m) => m.profile_id === userId)

        const {data: savedReport, error:saveError} = await this.supabase.client.from('reports')
        .insert({
            content_json: contentJson,
            project_id: projectId,
            title: `Contribution Report - ${new Date().toLocaleDateString('id-ID')}`,
            type: 'CONTRIBUTION',
            created_by_member_id: creatorMember?.id || null, 
        }).select().single()
        if(saveError || !savedReport){
            throw new BadRequestException('Failed to save report to database: ' + saveError?.message);
        }
        return savedReport;
    }

    async getProjectReportsHistory(projectId:string){
        const {data, error} = await this.supabase.client.from('reports').select(`
            id,title,type, created_at,
            created_by: project_members(
                profiles(name, profile_image_url)
            )
            `).eq('project_id',projectId).order('created_at', {ascending: false})
        if(error) throw new BadRequestException('Failed to fetch reports history: '+error.message)
        return data
    }

    async getReportById(projectId:string, reportId:string){
        const {data, error} = await this.supabase.client.from('reports').select(`*`)
        .eq('project_id',projectId)
        .eq('id',reportId)
        .single()
        if(error || !data) throw new NotFoundException('Report not found')
        return data
    }





}
