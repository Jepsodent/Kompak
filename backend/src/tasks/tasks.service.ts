import { Injectable } from '@nestjs/common';
import { SupabaseRequestService } from 'src/supabase/supabase-request.service';
import { CreateTasksDto } from './dto/create-tasks.dto';

@Injectable()
export class TasksService {
    constructor(private readonly supabase:SupabaseRequestService){}

    async createTask(projectId:string, dto:CreateTasksDto){}

}
