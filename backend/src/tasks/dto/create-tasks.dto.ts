import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";



export class CreateTasksDto{ 

    @IsString()
    @IsNotEmpty({message: "Title should not be empty"})
    title: string;
    
    @IsString()
    @IsOptional()
    description:string;
    
    @IsDateString()
    @IsNotEmpty({message: "Due date should not empty"})
    due_date: string;
}