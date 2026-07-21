import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ProjectRole } from 'src/common/enums/project-role.enum';
import { RoleGuard } from 'src/common/guards/roles.guard';
import { SupabaseGuard } from 'src/supabase/guards/supabase.guard';
import { CreateTasksDto } from './dto/create-tasks.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type User } from '@supabase/supabase-js';
import { TasksService } from './tasks.service';

@Controller('projects/:projectId/tasks')
@UseGuards(SupabaseGuard, RoleGuard)
export class TasksController {
    constructor(private readonly taskService:TasksService){}

    @Post()
    @Roles(ProjectRole.LEADER, ProjectRole.MEMBER)
    async createTask(@Param('projectId') projectId:string, @Body()dto:CreateTasksDto, @CurrentUser() user:User){
        return this.taskService.createTask(projectId, dto, user.id)
    }
    
    @Get()
    @Roles(ProjectRole.LEADER, ProjectRole.MEMBER)
    async getAllTasks(@Param('projectId') projectId:string){
        return this.taskService.getAllTasks(projectId)
    }

    @Get(':taskId')
    @Roles(ProjectRole.LEADER, ProjectRole.MEMBER)
    async getTaskById(@Param('projectId') projectId:string, @Param('taskId') taskId:string){
        return this.taskService.getTaskById(projectId, taskId)
    }   

    //only core tasks update: description , title , and due date 
    @Patch(':taskId')
    @Roles(ProjectRole.LEADER, ProjectRole.MEMBER)
    async updateTask(@Param('projectId') projectId:string, @Param('taskId') taskId:string){
        return this.taskService.updateTask(projectId, taskId)
    }

    @Delete(':taskId')
    @Roles(ProjectRole.LEADER, ProjectRole.MEMBER)
    async deleteTask(@Param('projectId') projectId:string, @Param('taskId') taskId:string){
        return this.taskService.deleteTask(projectId, taskId)
    }


}
