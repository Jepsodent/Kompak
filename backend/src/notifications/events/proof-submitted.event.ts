
export class ProofSubmittedEvent {
    constructor(
        public readonly taskId:string,
        public readonly projectId:string,
        public readonly taskTitle: string,
        public readonly submitterName: string,
    ){}
}