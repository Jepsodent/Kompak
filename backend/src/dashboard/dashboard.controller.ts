import { Controller, Get, UseGuards } from '@nestjs/common';
import { type User } from '@supabase/supabase-js';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { SupabaseGuard } from 'src/supabase/guards/supabase.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(SupabaseGuard)
export class DashboardController {
    constructor(private readonly dashboardService:DashboardService){}
    
    @Get()
    async getDashboardStat(@CurrentUser() user:User){
        return this.dashboardService.getDashboardStat(user.id)
    }


}
