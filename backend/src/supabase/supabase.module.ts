import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { SupabaseRequestService } from './supabase-request.service';
import { SupabaseGuard } from './guards/supabase.guard';
@Global()
@Module({
    providers:[SupabaseService,SupabaseRequestService,SupabaseGuard],
    exports: [SupabaseService, SupabaseRequestService, SupabaseGuard]
})
export class SupabaseModule {}
