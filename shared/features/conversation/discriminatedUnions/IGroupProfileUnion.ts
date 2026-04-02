import z from "zod";



export const GroupProfileUnionSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("custom"),
        groupChatProfileImgUrl: z.string(),
    }),
    z.object({
        type: z.literal("participants"),
        participants: z.array(
            z.object({
                participantId: z.string(),
                profileImgUrl: z.string().optional(),
            })
        ).min(1, { message: "At least one participant profile image URL is required" }),
        
    })
]);


export type IGroupProfileUnion = z.infer<typeof GroupProfileUnionSchema>;