
export interface TaskWithStatus {
    id: string;
    title:string;
    due_date:string | null;
    task_statuses: {
        code: string;
    } | null
}

export interface TaskDistribution{
    TODO: number;
    IN_PROGRESS: number;
    IN_REVIEW: number;
    DONE: number;
}
export interface DashboardStats{
    total_tasks:number;
    tasks: TaskWithStatus[];
    completion_rate:number;
    task_distribution: TaskDistribution
}