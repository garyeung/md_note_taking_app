import { z } from "zod";

export const grammarCheckSchema = z.object({
    text: z.string().max(5000, "Limit to 5000 charactors")

})

export type GrammarCheckDto = z.infer<typeof grammarCheckSchema>;