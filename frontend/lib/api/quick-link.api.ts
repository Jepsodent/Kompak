import { axiosClient } from "../axios";

export const LinkService = {
    addQuicklink: async(projectId:string, dto: {title: string; url:string}) => {
        const {data} = await axiosClient.post(`/projects/${projectId}/quick-links`, dto)
        return data.data
    },

    editQuicklink: async(projectId:string, linkId:string,dto: {title:string; url:string}) => {
        const {id, ...dtoData} = dto
        // console.log(dtoData)
        const {data} = await axiosClient.patch(`/projects/${projectId}/quick-links/${linkId}`, dtoData)
        return data.data
    },

    removeQuicklink: async(projectId:string, linkId:string) => {
        const {data} = await axiosClient.delete(`/projects/${projectId}/quick-links/${linkId}`)
        return data.data
    }
}