import { TaskReviewAction } from "src/common/enums/task-review-action.enum";

export class TaskReviewEvent {
    
    constructor(
        public readonly taskId: string,
        public readonly projectId:string,
        public readonly taskTitle:string,
        public readonly recipentProfileId: string, //profile Id dari member yang mensubmit proof of work
        public readonly action: TaskReviewAction,
        public readonly feedback: string,

    ){}
    
}