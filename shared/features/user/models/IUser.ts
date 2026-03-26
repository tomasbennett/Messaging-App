import z from "zod";
import { loginFormSchema } from "../../auth/models/ILoginSchema";



export const BaseUserSchema = loginFormSchema.extend({
    userId: z.string().min(1, { message: "User ID is required" }),
});


export type IBaseUser = z.infer<typeof BaseUserSchema>;