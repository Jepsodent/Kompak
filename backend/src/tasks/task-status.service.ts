import { Injectable, OnModuleInit } from "@nestjs/common";
import { TaskStatusCode } from "src/common/enums/task-status.enum";
import { SupabaseService } from "src/supabase/supabase.service";



@Injectable()
export class TaskStatusService implements OnModuleInit {
    private statusMap = {}  as Record<TaskStatusCode, string>;
    constructor(private readonly supabaseAdmin: SupabaseService){}

    async onModuleInit() {
        const defaultStatuses = [
            {code: 'TODO', name: 'To Do',sort_order: 1}, 
            {code: 'IN_PROGRESS', name: 'In Progress',sort_order: 2}, 
            {code: 'IN_REVIEW', name: 'In Review',sort_order: 3}, 
            {code: 'DONE', name: 'Done',sort_order: 4}, 
            
        ]
        await this.supabaseAdmin.client.from('task_statuses').upsert(
            defaultStatuses, {onConflict: 'code', ignoreDuplicates: true})
        
        const {data, error} = await this.supabaseAdmin.client.from('task_statuses').select('code,id')

        if(!data || error || data.length === 0){
            throw new Error('Failed to self-heal task_statuses in DB!')
        }
        data.forEach((status) => {
            this.statusMap[status.code] = status.id
        })
        // console.log('Status map loaded', this.statusMap)
    }

    getStatusId(code:TaskStatusCode):string {
        return this.statusMap[code]
    }
}