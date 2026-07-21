export type TaskStatusCode = typeof TASK_STATUS_CODES[number];

export const TASK_STATUS_CODES = ['TODO', 'IN_PROGRESS','IN_REVIEW','DONE'] as const;