import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type User } from '@supabase/supabase-js';
import { SupabaseGuard } from 'src/supabase/guards/supabase.guard';
import { RoleGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ProjectRole } from 'src/common/enums/project-role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('projects/:projectId/reports')
@UseGuards(SupabaseGuard, RoleGuard)
@Roles(ProjectRole.LEADER, ProjectRole.MEMBER)
@ApiBearerAuth('access-token')
export class ReportsController {

    constructor (private readonly reportsService: ReportsService){}
    @Get()
    async getProjectReportsHistory(@Param('projectId') projectId:string){
        return this.reportsService.getProjectReportsHistory(projectId)
    }

    @Get(':reportId')
    async getReportById(@Param('projectId') projectId: string, @Param('reportId') reportId:string){
        return this.reportsService.getReportById(projectId, reportId)
    }

    @Post('contribution')
    async generateContributionPaper(@Param('projectId') projectId:string, @CurrentUser() user:User){
        return this.reportsService.generateContributionPaper(projectId, user.id)
    }

}
