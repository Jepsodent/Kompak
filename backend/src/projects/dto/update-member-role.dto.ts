import { IsEnum, IsNotEmpty } from "class-validator";
import { ProjectRole } from "src/common/enums/project-role.enum";


export class UpdateMemberRoleDto{ 

    @IsEnum(ProjectRole)
    @IsNotEmpty({message: "Role should not empty"})
    role: ProjectRole
}