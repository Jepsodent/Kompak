import { DashboardService } from "@/lib/api/dashboard.api"
import { DashboardData } from "@/types/dashboard.type"
import { useEffect, useState } from "react"

export function useDashboard(){
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)


    useEffect(() => {
        const fetchDashboard = async() => {
            try {
                const res =  await DashboardService.getStats()
                setData(res)
            } catch (error) {
                console.error('Failed to fetch dashboard stats', error)
                setError("Failed to fetch dashboard stats")
            }finally{
                setLoading(false)
            }
        }
        fetchDashboard()
    }, [])
    return {data, loading, error}
}