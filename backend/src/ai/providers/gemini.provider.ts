import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { GeneratedTaskFormat, IAiProvider } from "../interfaces/ai-provider.interface";
import { GoogleGenAI, Type} from "@google/genai";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GeminiProvider implements IAiProvider{
    private ai:  GoogleGenAI
    constructor(private configService:ConfigService){
        const apiKey = this.configService.get<string>('GEMINI_API_KEY')
        this.ai = new GoogleGenAI({apiKey})
    }

    async generateTasks(prompt: string): Promise<GeneratedTaskFormat[]> {
        try{ 
            const response = await this.ai.models.generateContent({
                model: 'gemini-flash-latest',
                contents: `Breakdown deskripsi berikut menjadi daftar task yang terstruktur: \n ${prompt}`,
                config : {
                    systemInstruction: `You are an expert Agile Project Manager. Break down the given project description into actionable tasks`,
                    responseMimeType: 'application/json' ,
                    responseSchema: {
                        type : Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: {type: Type.STRING},
                                description: {type: Type.STRING},
                                recommendation_role: {type: Type.STRING}
                            },
                            required: ['title', 'description', 'recommendation_role']
                        },
                    }
                }
            })
            if(!response.text) return []
            return JSON.parse(response.text) as GeneratedTaskFormat[]
        }catch(error){
            throw new InternalServerErrorException('Failed generate tasks from Gemini '+ error?.message || 'Unknown error')
        }
    }
   
}