import { ProjectService } from "@/lib/services/project.service";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";



export function useCreateProject(){
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter()

    async function handleCreateProject(){
        if (isCreating) return;
        setIsCreating(true)
        try {
            const {data} = await ProjectService.createProject({title: "Untitled Project"})
            // console.log(data.id)
            router.push(`/projects/${data.id}`)
        } catch (error) {
            toast.error('Failed to create a new project')
            console.error(error)
        }finally{
            setIsCreating(false)
        }
    }
    return {handleCreateProject, isCreating}
}