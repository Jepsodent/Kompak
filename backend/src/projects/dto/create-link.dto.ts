import { IsNotEmpty, IsString, IsUrl, MaxLength } from "class-validator"


export class CreateLinkDto{
    
    @IsString()
    @MaxLength(30, {message: "Title too long"})
    @IsNotEmpty({message: "Title should not empty"})
    title: string
    
    @IsUrl({},{message: "URL is not valid"})
    @IsNotEmpty({message: "URL should not empty"})
    url:string
}