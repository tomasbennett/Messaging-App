import z from "zod";
import { DateFromStringSchema } from "../../util/models/IDateFromStringSchema";
import { ReceiveUserFrontendSchema } from "../../user/models/IFrontendUser";
import { ReceiveConversationFrontendSchema } from "../../conversation/models/IFrontendConversation";


export const BaseMessageSchema = z.object({
    messageId: z.string().min(1, { message: "Message ID is required" }),
    sender: ReceiveUserFrontendSchema.pick({
        userId: true,
        username: true,
        // profilePictureUrl: true,
    }),
    conversationId: z.string().min(1, { message: "Conversation ID is required" })
});


export type IBaseMessage = z.infer<typeof BaseMessageSchema>;