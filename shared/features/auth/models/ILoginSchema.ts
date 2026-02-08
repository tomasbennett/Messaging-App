import { z } from "zod";
import { maxUsernamePasswordLength, minUsernamePasswordLength, usernamePasswordRegex } from "../constants";


export const usernamePasswordSchema = z.string()
    .min(minUsernamePasswordLength, { message: `Must be at least ${minUsernamePasswordLength} characters long.` })
    .max(maxUsernamePasswordLength, { message: `Must be at most ${maxUsernamePasswordLength} characters long.` })
    .regex(usernamePasswordRegex, { message: "Can only contain letters, numbers, exclamation points or underscores." });


export type IUsernamePassword = z.infer<typeof usernamePasswordSchema>;


export const loginFormSchema = z.object({
    username: usernamePasswordSchema,
    password: usernamePasswordSchema
});

export type ILoginForm = z.infer<typeof loginFormSchema>;



export const SignInErrorSchema = z.object({
    message: z.string(),
    inputType: z.enum(["username", "password", "root"])
});

export type ISignInError = z.infer<typeof SignInErrorSchema>;