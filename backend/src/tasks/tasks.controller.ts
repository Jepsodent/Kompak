import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ProjectRole } from 'src/common/enums/project-role.enum';
import { RoleGuard } from 'src/common/guards/roles.guard';
import { SupabaseGuard } from 'src/supabase/guards/supabase.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type User } from '@supabase/supabase-js';
import { TasksService } from './tasks.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { SubmitProofDto } from './dto/submit-proof.dto';
import { ReviewTaskDto } from './dto/review-task.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateTaskDto } from './dto/create-task.dto';
import { BulkCreateTaskDto } from './dto/bulk-create-task.dto';

@Controller('projects/:projectId/tasks')
@ApiBearerAuth('access-token')
@UseGuards(SupabaseGuard, RoleGuard)
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @Post()
  @Roles(ProjectRole.LEADER, ProjectRole.MEMBER)
  async createTask(
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: User,
  ) {
    return this.taskService.createTask(projectId, dto, user.id);
  }

  @Get()
  @Roles(ProjectRole.LEADER, ProjectRole.MEMBER)
  async getAllTasks(@Param('projectId') projectId: string) {
    return this.taskService.getAllTasks(projectId);
  }

  @Get(':taskId')
  @Roles(ProjectRole.LEADER, ProjectRole.MEMBER)
  async getTaskById(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.taskService.getTaskById(projectId, taskId);
  }

  @Patch(':taskId')
  @Roles(ProjectRole.LEADER, ProjectRole.MEMBER)
  async updateTask(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.taskService.updateTask(projectId, taskId, dto);
  }

  @Delete(':taskId')
  @Roles(ProjectRole.LEADER, ProjectRole.MEMBER)
  async deleteTask(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.taskService.deleteTask(projectId, taskId);
  }

  @Post(':taskId/proof')
  @Roles(ProjectRole.LEADER, ProjectRole.MEMBER)
  async submitProof(
    @Param('taskId') taskId: string,
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
    @Body() dto: SubmitProofDto,
  ) {
    return this.taskService.submitProof(taskId, projectId, user.id, dto);
  }

  @Post(':taskId/review')
  @Roles(ProjectRole.LEADER)
  async taskReview(
    @Param('taskId') taskId: string,
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
    @Body() dto: ReviewTaskDto,
  ) {
    return this.taskService.reviewTask(taskId, projectId, user.id, dto);
  }

  @Post('generate-ai')
  @Roles(ProjectRole.LEADER)
  async generateTasksFromAI(
     @Param('projectId') projectId:string
  ){
    return this.taskService.generateTasksFromAI(projectId)
  }

  @Post('/bulk')
  @Roles(ProjectRole.LEADER, ProjectRole.MEMBER)
  async createBulkTask(@Param('projectId') projectId: string, @CurrentUser() user:User, @Body() dto:BulkCreateTaskDto){
    return this.taskService.createBulkTask(projectId, dto, user.id)
  }

}
