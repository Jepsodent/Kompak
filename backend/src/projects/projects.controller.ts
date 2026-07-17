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
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';

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

  @Post(':projectId/invitations')
  @Roles(ProjectRole.LEADER)
  generateInvitation(@Param('projectId') projectId:string){
    return this.projectsService.generateInvitation(projectId)
  }
  @Post('join')
  joinInvitation(@Body('token') token:string, @CurrentUser() user:User){
    return this.projectsService.joinInvitation(token, user.id)
  }

  // project member management
  @Get(':projectId/members')
  @Roles(ProjectRole.LEADER, ProjectRole.MEMBER)
  async getAllMember(@Param('projectId') projectId:string){
    return this.projectsService.getAllMember(projectId)
  }

  @Patch(':projectId/members/:memberId')
  @Roles(ProjectRole.LEADER)
  async updateMemberRole(@Param('projectId') projectId:string, @Param('memberId') memberId:string, @Body() dto:UpdateMemberRoleDto, @CurrentUser() user:User){
    return this.projectsService.updateMemberRole(projectId, memberId, dto, user.id)
  }

  @Delete(':projectId/members/:memberId')
  @Roles(ProjectRole.LEADER)
  async deleteMember(@Param('projectId') projectId:string, @Param('memberId') memberId:string){
    return this.projectsService.deleteMember(projectId,memberId)
  }

  // quick links
  @Post(':projectId/quick-links')
  @Roles(ProjectRole.LEADER, ProjectRole.MEMBER)
  async createLink(@Param('projectId')projectId:string, @CurrentUser() user:User, @Body() dto:CreateLinkDto){
    return this.projectsService.createLink(projectId, user.id, dto)
  }

  @Patch(':projectId/quick-links/:quickLinkId')
  @Roles(ProjectRole.LEADER, ProjectRole.MEMBER)
  async updateLink(@Param('projectId') projectId:string, @Param('quickLinkId') quickLinkId:string, @CurrentUser() user:User, @Body() dto:UpdateLinkDto){
    return this.projectsService.updateLink(projectId,quickLinkId, user.id, dto)
  }
  
  @Delete(':projectId/quick-links/:quickLinkId')
  @Roles(ProjectRole.LEADER, ProjectRole.MEMBER)
  async deleteLink(@Param('projectId') projectId:string, @Param('quickLinkId') quickLinkId:string){
    return this.projectsService.deleteLink(projectId,quickLinkId)
  }

  //dashboard
  @Get(':projectId/dashboard')
  @Roles(ProjectRole.LEADER, ProjectRole.MEMBER)
  async getProjectDashboard(@Param('projectId') projectId:string){
    return this.projectsService.getProjectDashboard(projectId)
  }


}
