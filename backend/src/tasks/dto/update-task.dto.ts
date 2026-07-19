import { PartialType } from "@nestjs/swagger";
import { CreateTasksDto } from "./create-tasks.dto";


export class UpdateTaskDto extends PartialType(CreateTasksDto) {}