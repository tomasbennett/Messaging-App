import z from "zod";
import { BaseConversationSchema } from "./IBaseConversation";



export const CreateNewConversationSchema = z.object({
    name: BaseConversationSchema.shape.name,
    participantIds: z.array(z.string()),
});


export type ICreateNewConversation = z.infer<typeof CreateNewConversationSchema>;