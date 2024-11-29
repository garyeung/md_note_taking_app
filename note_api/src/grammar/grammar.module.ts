import { Module } from "@nestjs/common";
import { GrammarService } from "./grammar.service";

@Module({
    imports: [],
    providers: [GrammarService],
    exports: [GrammarService]    
})

export class GrammarModule {} 