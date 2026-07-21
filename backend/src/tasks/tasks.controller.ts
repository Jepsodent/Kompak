import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ProjectRole } from 'src/common/enums/project-role.enum';
import { RoleGuard } from 'src/common/guards/roles.guard';
import { SupabaseGuard } from 'src/supabase/guards/supabase.guard';
import { CreateTasksDto } from './dto/create-tasks.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type User } from '@supabase/supabase-js';
import { TasksService } from './tasks.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignMemberTaskDto } from './dto/assign-member.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { SubmitProofDto } from './dto/submit-proof.dto';
import { ReviewTaskDto } from './dto/review-task.dto';

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
    async updateTask(@Param('projectId') projectId:string, @Param('taskId') taskId:string, @Body() dto:UpdateTaskDto){
        return this.taskService.updateTask(projectId, taskId, dto)
    }

    @Delete(':taskId')
    @Roles(ProjectRole.LEADER, ProjectRole.MEMBER)
    async deleteTask(@Param('projectId') projectId:string, @Param('taskId') taskId:string){
        return this.taskService.deleteTask(projectId, taskId)
    }

    @Post(':taskId/assign')
    @Roles(ProjectRole.LEADER, ProjectRole.MEMBER)
    async assignMemberTask(@Param('projectId') projectId:string, @Param('taskId') taskId:string, @Body() dto: AssignMemberTaskDto){
        return this.taskService.assignMemberTask(projectId, taskId,dto)
    }


    @Delete(':taskId/assign/:memberId')
    @Roles(ProjectRole.LEADER, ProjectRole.MEMBER)
    async unassignMemberTask(@Param('projectId') projectId:string, @Param('taskId') taskId:string, @Param('memberId', ParseUUIDPipe) memberId:string){
        return this.taskService.unassignMemberTask(projectId, taskId, memberId)

    }

    //update status workflow
    @Patch(':taskId/status')
    @Roles(ProjectRole.LEADER, ProjectRole.MEMBER)
    async updateTaskStatus(@Param('taskId') taskId:string, @CurrentUser() user:User, @Param('projectId') projectId:string, @Body() dto:UpdateTaskStatusDto){
        return this.taskService.updateTaskStatus(taskId, user.id, projectId, dto)
    }

    @Post(':taskId/proof')
    @Roles(ProjectRole.LEADER, ProjectRole.MEMBER)
    async submitProof(@Param('taskId') taskId:string,@Param('projectId') projectId:string,@CurrentUser() user:User,@Body() dto:SubmitProofDto){
        return this.taskService.submitProof(taskId,projectId, user.id, dto)
    }

    @Post(':taskId/review')
    @Roles(ProjectRole.LEADER)
    async taskReview(@Param('taskId') taskId:string, @Param('projectId') projectId:string, @CurrentUser() user:User,@Body() dto:ReviewTaskDto){
        return this.taskService.reviewTask(taskId,projectId, user.id, dto)
    }


}
