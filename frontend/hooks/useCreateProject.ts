import { ProjectService } from "@/lib/api/project.api";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";



export function useCreateProject(){
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter()
    const queryClient = useQueryClient()

    async function handleCreateProject(){
        if (isCreating) return;
        setIsCreating(true)
        try {
            const newProject = await ProjectService.createProject({title: "Untitled Project", background: "", expected_result: "", method: "",objective: ""
            })
            // console.log(data.id)
            queryClient.invalidateQueries({queryKey: ['dashboard']})
            router.push(`/projects/${newProject.id}`)
            
        } catch (error) {
            toast.error('Failed to create a new project')
            console.error(error)
        }finally{
            setIsCreating(false)
        }
    }
    return {handleCreateProject, isCreating}
}