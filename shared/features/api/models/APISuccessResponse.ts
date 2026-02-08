import z from "zod";


export const APISuccessSchema = z.object({
    ok: z.literal(true),
    status: z.number(),
    message: z.string()
});



export type ICustomSuccessMessage = z.infer<typeof APISuccessSchema>;