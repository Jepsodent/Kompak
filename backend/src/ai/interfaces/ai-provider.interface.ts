export interface GeneratedTaskFormat {
    title: string;
    description:string;
    recommendation_role: string;    
}

export interface IAiProvider {
    generateTasks(prompt:string): Promise<GeneratedTaskFormat[]>
}