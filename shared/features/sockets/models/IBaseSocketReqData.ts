import z from "zod";



export const BaseSocketUserReqData = z.object({
    accessToken: z.string()
});



export type IBaseSocketUserReqData = z.infer<typeof BaseSocketUserReqData>;