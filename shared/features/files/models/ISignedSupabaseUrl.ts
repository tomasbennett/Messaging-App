import z from "zod";
import { APISuccessSchema } from "../../api/models/APISuccessResponse";



export const SignedSupabaseUrlSchema = APISuccessSchema.extend({
    signedUrl: z.string(),
});


export type ISignedSupabaseUrl = z.infer<typeof SignedSupabaseUrlSchema>;