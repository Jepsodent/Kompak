import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { TASK_REVIEW_ACTION, TaskReviewAction } from "src/common/enums/task-review-action.enum";



export class ReviewTaskDto{
    @IsNumber()
    @IsNotEmpty()
    rating: number;

    @IsString()
    @IsOptional()
    feedback?: string;

    @IsString()
    @IsIn(TASK_REVIEW_ACTION, {message: "Action must be one of: Approve, Reject" })    
    action: TaskReviewAction
}