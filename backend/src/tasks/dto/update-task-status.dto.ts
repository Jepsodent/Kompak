import { IsIn, IsNotEmpty, IsString } from "class-validator";
import { TASK_STATUS_CODES, TaskStatusCode } from "src/common/enums/task-status.enum";


export class UpdateTaskStatusDto{
    @IsString()
    @IsNotEmpty()
    @IsIn(TASK_STATUS_CODES, {message: "Status must be one of: TODO, IN_PROGRESS, IN_REVIEW, DONE"})
    status:TaskStatusCode;
}