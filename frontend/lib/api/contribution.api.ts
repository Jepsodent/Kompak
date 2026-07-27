import { NestResponse } from "@/types/api.type";
import { axiosClient } from "../axios";

export const ContributionService = {
  getContributions: async (
    projectId: string,
  ): Promise<GetContributionsPayload[]> => {
    const response = await axiosClient.get<
      NestResponse<GetContributionsPayload[]>
    >(`/projects/${projectId}/reports`);

    return response.data.data;
  },

  getContributionById: async (
    projectId: string,
    reportId: string,
  ): Promise<GetContributionByIdPayload> => {
    const response = await axiosClient.get<
      NestResponse<GetContributionByIdPayload>
    >(`/projects/${projectId}/reports/${reportId}`);

    return response.data.data;
  },

  createContributionReport: async (
    projectId: string,
  ): Promise<GetContributionByIdPayload> => {
    const response = await axiosClient.post<
      NestResponse<GetContributionByIdPayload>
    >(`/projects/${projectId}/reports/contribution`);

    return response.data.data;
  },
};
