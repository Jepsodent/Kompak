import { axiosClient } from "../axios"


export const DashboardService = {
    getStats: async () => {
        const {data} = await axiosClient.get('/dashboard')
        return data
    }
}