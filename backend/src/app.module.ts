import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import * as Joi from 'joi';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        SUPABASE_URL: Joi.string().required(),
        SUPABASE_PUBLISHABLE_KEY: Joi.string().required(),
        SUPABASE_SECRET_KEY: Joi.string().required(),
        PORT: Joi.number().default(3000),
        //nanti lagi kalo ada yg wajib
      }),
    }),
    SupabaseModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
