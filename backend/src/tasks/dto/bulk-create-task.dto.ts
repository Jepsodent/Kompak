import { IsArray, ValidateNested } from "class-validator"
import { CreateTaskDto } from "./create-task.dto"
import { Type } from "class-transformer"

export class BulkCreateTaskDto{ 

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => CreateTaskDto)
    tasks!: CreateTaskDto[]
}