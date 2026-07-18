import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { ConfigService } from '@nestjs/config';
import { SupabaseRequestService } from 'src/supabase/supabase-request.service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, ConfigService, SupabaseRequestService],
})
export class ProfileModule {}
