import { Inject, Injectable, Scope } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { REQUEST } from "@nestjs/core";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { type  Request } from "express";
import { Database } from "src/types/supabase.types";

//dibuat instance per request (supabase instance stateful) -- public
@Injectable({scope: Scope.REQUEST})
export class SupabaseRequestService {
    public readonly client: SupabaseClient<Database>;
    constructor(
        @Inject(REQUEST) private request: Request,
        private configService: ConfigService,
    ){
        const token = this.request.headers.authorization?.replace('Bearer ', '');
        this.client = createClient<Database>(
            this.configService.get<string>('SUPABASE_URL')!,
            this.configService.get<string>('SUPABASE_ANON_KEY')!,
            {
                global: {
                    headers: {Authorization: `Bearer ${token}`}
                }
            }
        )
    }
}