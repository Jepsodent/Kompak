import { Body, Controller, Post, UseGuards, Param, Patch, Get, Delete } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { SupabaseGuard } from 'src/supabase/guards/supabase.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type User } from '@supabase/supabase-js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ProjectRole } from 'src/common/enums/project-role.enum';
import { RoleGuard } from 'src/common/guards/roles.guard';
import { EditProjectDto } from './dto/edit-project.dto';

@Controller('projects')
@ApiBearerAuth('access-token')
@UseGuards(SupabaseGuard, RoleGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async createProject(@Body() dto:CreateProjectDto, @CurrentUser() user:User){
    return this.projectsService.createProject(dto, user.id)
  }

  @Patch(':projectId')
  @Roles(ProjectRole.LEADER)
  async updateProject(@Param('projectId') projectId:string, @Body() dto:EditProjectDto ,@CurrentUser() user:User ){
    return this.projectsService.updateProject(dto, user.id, projectId)
  }

  @Get(':projectId')
  @Roles(ProjectRole.LEADER, ProjectRole.MEMBER)
  async getProjectById(@Param('projectId') projectId:string){
    return this.projectsService.getProjectById(projectId)
  }

  @Delete(':projectId')
  @Roles(ProjectRole.LEADER)
  async deleteProject(@Param('projectId') projectId:string){
    return this.projectsService.deleteProject(projectId)
  }


}
