import { CreateTaskFormValues } from "@/schemas/task.schema";
import { axiosClient } from "../axios";
import { NestResponse } from "@/types/api.type";
import {
  BulkTaskCreatePayload,
  CreateTaskPayload,
  GeneratedTask,
  Task,
  UpdateTaskPayload,
} from "@/types/task.type";

export const TaskService = {
  getTasks: async (projectId: string): Promise<Task[]> => {
    const response = await axiosClient.get<NestResponse<Task[]>>(
      `/projects/${projectId}/tasks`,
    );

    return response.data.data;
  },

  getTaskById: async (projectId: string, taskId: string): Promise<Task> => {
    const response = await axiosClient.get<NestResponse<Task>>(
      `/projects/${projectId}/tasks/${taskId}`,
    );

    return response.data.data;
  },

  createTask: async (
    projectId: string,
    payload: CreateTaskPayload,
  ): Promise<Task> => {
    const response = await axiosClient.post<NestResponse<Task>>(
      `/projects/${projectId}/tasks`,
      payload,
    );
    console.log("Error: " + response.data.message);

    return response.data.data;
  },

  updateTask: async (
    projectId: string,
    taskId: string,
    payload: UpdateTaskPayload,
  ): Promise<Task> => {
    const response = await axiosClient.patch<NestResponse<Task>>(
      `/projects/${projectId}/tasks/${taskId}`,
      payload,
    );

    return response.data.data;
  },

  deleteTask: async (projectId: string, taskId: string): Promise<null> => {
    const response = await axiosClient.delete<NestResponse<null>>(
      `/projects/${projectId}/tasks/${taskId}`,
    );

    return response.data.data;
  },

  generateTask: async (projectId: string): Promise<GeneratedTask[]> => {
    const response = await axiosClient.post<NestResponse<GeneratedTask[]>>(
      `/projects/${projectId}/tasks/generate-ai`,
    );

    return response.data.data;
  },

  bulkCreateTask: async (
    projectId: string,
    payload: BulkTaskCreatePayload,
  ): Promise<null> => {
    const response = await axiosClient.post<NestResponse<null>>(
      `/projects/${projectId}/tasks/bulk`,
      payload,
    );

    return response.data.data;
  },
};
