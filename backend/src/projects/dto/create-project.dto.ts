import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";



export class CreateProjectDto{
    @IsString()
    @IsNotEmpty({message: "Title required!"})
    @MaxLength(30, {message: 'Title should not be more than 30 characters'})
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