import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskStatusService } from './task-status.service';
import { AiModule } from 'src/ai/ai.module';

@Module({
  imports: [AiModule],
  providers: [TasksService, TaskStatusService],
  controllers: [TasksController],
  exports: [TaskStatusService]
})
export class TasksModule {}
