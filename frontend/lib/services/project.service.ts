import { Project, ProjectDashboardResponse, ProjectMember } from "@/types/project.type";
import { axiosClient } from "../axios"



export const ProjectService = {
    getById:  async (projectId:string): Promise<Project>=> {
        const {data} = await axiosClient.get(`projects/${projectId}`)
        return data.data
    },

    getProjectDashboard: async (projectId:string): Promise<ProjectDashboardResponse> => {
        const {data} = await axiosClient.get(`projects/${projectId}/dashboard`)
        return data.data
    },

    createProject: async(dto:{
        title:string;
        background?:string;
        objective?:string;
        method?:string;
        expected_result?:string
    }): Promise<Project> => {
        const {data} = await axiosClient.post('/projects',dto)
        return data.data;
    },

    updateProject:  async(id:string, dto: 
        Partial<{ title: string; objective: string; method: string; expected_result: string }>
    ):Promise<Project> => {
        const {data} = await axiosClient.patch(`/projects/${id}`, dto)
        return data.data
    },

    deleteProject: async(id: string):Promise<{ message: string }> => {
        const { data } = await axiosClient.delete(`/projects/${id}`);
        return data.data;
    },

    generateInvitation: async(projectId:string): Promise<string>  => {
        const { data } = await axiosClient.post(`/projects/${projectId}/invitations`);
        return data.data;
    },
    joinProject: async(token:string) => {
        const { data } = await axiosClient.post(`/projects/join`, { token });
        return data.data;
    },
    getProjectMembers: async(projectId:string):Promise<ProjectMember[]>=> {
        const { data } = await axiosClient.get(`/projects/${projectId}/members`);
        return data.data;
    },
    updateMemberRole: async(projectId:string, memberId:string, role: "LEADER" | "MEMBER") => {
        const { data } = await axiosClient.patch(`/projects/${projectId}/members/${memberId}`, { role });
        return data.data;
    },
    kickMember: async(projectId:string, memberId:string) => {
        const { data } = await axiosClient.delete(`/projects/${projectId}/members/${memberId}`);
        return data.data;
    },  



}