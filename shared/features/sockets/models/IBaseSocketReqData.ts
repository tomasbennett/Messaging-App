import z from "zod";



export const BaseSocketUserReqData = z.object({
    accessToken: z.string()
});



export type IBaseSocketUserReqData = z.infer<typeof BaseSocketUserReqData>;


export const BaseSocketEmitData = z.object({
    userSocketId: z.string()
});


export type IBaseSocketEmitData = z.infer<typeof BaseSocketEmitData>;