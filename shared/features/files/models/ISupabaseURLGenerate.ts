import z from "zod";
import { APISuccessSchema } from "../../api/models/APISuccessResponse";


export const SupabaseURLGenerateSchema = APISuccessSchema.extend({
    supabasePublicURL: z.string({ message: "Supabase public URL is required" }).min(1, { message: "Supabase public URL cannot be empty" }),
});



export type ISupabaseURLGenerateResponse = z.infer<typeof SupabaseURLGenerateSchema>;