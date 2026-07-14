import { axiosClient } from "../axios"



export const ProjectService = {
    getById:  async (projectId:string) => {
        const {data} = await axiosClient.get(`projects/${projectId}`)
        return data
    }
}