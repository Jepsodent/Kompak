import { DashboardService } from "@/lib/api/dashboard.api"
import { useQuery } from "@tanstack/react-query"

export function useDashboard(){
    const dashboardQuery = useQuery({
        queryKey: ['dashboard'],
        queryFn: () => DashboardService.getStats(),
    })

    // console.log(dashboardQuery.error)
    return {
        data: dashboardQuery.data,
        loading: dashboardQuery.isLoading,
        error: dashboardQuery.error?.message 
    }

}