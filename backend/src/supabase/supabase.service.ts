import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/types/supabase.types';


//admin key /service role key
@Injectable()
export class SupabaseService {
    public readonly client:SupabaseClient<Database>
    constructor(private configService: ConfigService){
        this.client = createClient<Database>(
            this.configService.get<'string'>('SUPABASE_URL')!,
            this.configService.get<'string'>('SUPABASE_SERVICE_ROLE_KEY')!,
        )
    }
}
