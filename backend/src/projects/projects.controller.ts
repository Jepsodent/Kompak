import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { SupabaseGuard } from 'src/supabase/guards/supabase.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type User } from '@supabase/supabase-js';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('projects')
@ApiBearerAuth('access-token')
@UseGuards(SupabaseGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async createProject(@Body() dto:CreateProjectDto, @CurrentUser() user:User){
    return this.projectsService.createProject(dto, user.id)
  }


}
