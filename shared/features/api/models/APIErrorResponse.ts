import z from "zod";


export const APIErrorSchema = z.object({
    ok: z.literal(false),
    status: z.number(),
    message: z.string()
});


export type ICustomErrorResponse = z.infer<typeof APIErrorSchema>;



