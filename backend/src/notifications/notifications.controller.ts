import { Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type User } from '@supabase/supabase-js';
import { SupabaseGuard } from 'src/supabase/guards/supabase.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('notifications')
@ApiBearerAuth('access-token')
@UseGuards(SupabaseGuard)
export class NotificationsController {
    constructor(private readonly notificationService:NotificationsService){}

    @Get()
    async getMyNotifications(@CurrentUser() user:User){
        return this.notificationService.getUserNotifications(user.id)
    }

    @Post(':notificationId')
    async markReadNotification(@CurrentUser() user:User, @Param('notificationId', ParseUUIDPipe) notificationId:string){
        return this.notificationService.markAsRead(user.id, notificationId) 
    }


}
