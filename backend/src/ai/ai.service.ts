import { Injectable } from "@nestjs/common";
import { IAiProvider } from "./interfaces/ai-provider.interface";
import { ConfigService } from "@nestjs/config";
import { GeminiProvider } from "./providers/gemini.provider";




@Injectable()
export class AiService{
    private providers = new Map<string, IAiProvider>();

    constructor(
        private configService: ConfigService,
        private geminiProvider: GeminiProvider,
        // provider baru tinggal tambah lagi deh
    ){
        this.providers.set('gemini', geminiProvider)
    }
    async generateasks(prompt:string){
        const selected = this.configService.get<string>('AI_PROVIDER', 'gemini')

        const provider = this.providers.get(selected) || this.providers.get('gemini');
        return provider!.generateTasks(prompt)
    }


}