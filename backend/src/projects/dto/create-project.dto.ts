import { IsNotEmpty, IsOptional, IsString } from "class-validator";



export class CreateProjectDto{
    @IsString()
    @IsNotEmpty({message: "Title required!"})
    title: string;

    @IsString()
    @IsOptional()
    background?:string;
    
    @IsString()
    @IsOptional()
    objective?:string;
    
    @IsString()
    @IsOptional()
    method?:string;
    
    @IsString()
    @IsOptional()
    expected_result?:string;


}