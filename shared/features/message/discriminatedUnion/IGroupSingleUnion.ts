import z from "zod";
import { usernamePasswordSchema } from "../../auth/models/ILoginSchema";




export const ConversationGroupSingleUnionSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("group"),
        // senderId: z.string(),
        senderName: usernamePasswordSchema,
        senderProfileImgUrl: z.string().optional(),
    }),
    z.object({
        type: z.literal("single"),
        // senderId: z.string(),
    }),
]);


export type IConversationGroupSingleUnion = z.infer<typeof ConversationGroupSingleUnionSchema>;