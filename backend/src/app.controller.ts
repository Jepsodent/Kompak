import { Controller, Get } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service';

@Controller()
export class AppController {
  constructor(private readonly supabase:SupabaseService) {}

  @Get()
  async getHello() {
    return this.supabase.client.from('profiles').select('*').limit(1);
  }
}
