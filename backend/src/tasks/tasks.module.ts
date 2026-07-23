import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskStatusService } from './task-status.service';

@Module({
  providers: [TasksService, TaskStatusService],
  controllers: [TasksController],
  exports: [TaskStatusService]
})
export class TasksModule {}
