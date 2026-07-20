import { IsNotEmpty, IsUUID } from "class-validator";

export class AssignMemberTaskDto{
    @IsUUID()
    @IsNotEmpty({message: "Assignee member should not empty"})
    memberId: string;
}