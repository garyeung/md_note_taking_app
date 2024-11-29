import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class GrammarService{

    async checkGrammar(text:string){
        try {
                const response = await axios.post(
                    process.env.GRAMMAR_API!,
                    new URLSearchParams({
                    text: text,
                    language: 'en'
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    }

                })

                if(!response.data){
                    throw new Error('Invalid response from grammar API');
                }
                return response.data.matches;
            
        } catch (error) {
            if(axios.isAxiosError(error)){
                throw new Error(error.message);
            }
           throw error;
        }
    }
}