import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";



export class SubmitProofDto{
    @IsString()
    @IsNotEmpty()
    summary_notes: string

    @IsArray()
    @IsOptional()
    attachments?: {
        file_name:string;
        file_url:string;
        mime_type:string
    }[];
}