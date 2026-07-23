import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { ProjectsModule } from './projects/projects.module';
import { DashboardModule } from './dashboard/dashboard.module';
import * as Joi from 'joi';
import { ProfileModule } from './profile/profile.module';
import { TasksService } from './tasks/tasks.service';
import { TasksController } from './tasks/tasks.controller';
import { TasksModule } from './tasks/tasks.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        SUPABASE_URL: Joi.string().required(),
        SUPABASE_PUBLISHABLE_KEY: Joi.string().required(),
        SUPABASE_SECRET_KEY: Joi.string().required(),
        INV_JWT_SECRET: Joi.string().default('2d'),
        INV_JWT_EXPIRES_IN: Joi.string().required(),
        PORT: Joi.number().default(3001),
        FRONTEND_URL: Joi.string().default('http://localhost:3001'),
        //nanti lagi kalo ada yg wajib
      }),
    }),
    SupabaseModule,
    ProjectsModule,
    DashboardModule,
    ProfileModule,
    TasksModule,
  ],
  controllers: [AppController, TasksController],
  providers: [TasksService],
})
export class AppModule {}
