import z from "zod";
import { loginFormSchema } from "../../auth/models/ILoginSchema";



export const BaseUserSchema = loginFormSchema.extend({
    userId: z.string(),
});


export type IBaseUser = z.infer<typeof BaseUserSchema>;